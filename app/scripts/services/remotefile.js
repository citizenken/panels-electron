'use strict';

/**
 * @ngdoc service
 * @name panels.RemoteFile
 * @description
 * # RemoteFile
 * Factory in the panels.
 */
angular.module('panels')
  .factory('RemoteFile', ['File', 'firebaseService', '$firebaseObject', 'lodash',
    function (File, firebaseService, $firebaseObject, lodash) {
    var filePrefix = 'panelsFile_';
    var fromRemote = function (remote) {
      var self = this;
      angular.forEach(remote, function (value, key) {
        if (key[0] !== '$') {
          self[key] = value;
        }
        self.id = remote.$id;
        self.sync = true;
      });
      return self;
    };

    var fromLocal = function (file) {
      var self = this,
      fileRef = firebaseService.fileRoot.child(file.id),
      remoteFile = $firebaseObject(fileRef);
      firebaseService.files[file.id] = remoteFile;

      angular.forEach(file, function (value, key) {
        if (typeof value !== 'function') {
          self[key] = value;
        }
      });

      self.save();
      return self;
    };

    var syncFileWithRemote = function () {
      var self = this,
      firebaseFile = firebaseService.files[this.id];
      // Insert logic to check modified on date
      if (lodash.has(firebaseFile, 'modifiedOn') && firebaseFile.modifiedOn > this.modifiedOn) {
        angular.forEach(firebaseFile, function (value, key) {
          if (key[0] !== '$') {
            self[key] = value;
          }
        });

      } else {
        angular.forEach(this, function (value, key) {
          if (typeof value !== 'function') {
            firebaseFile[key] = value;
          }
        });

      }

      firebaseFile.$save()
      .then(function (success) {
        console.log(success);
      })
      .catch(function (error) {
        console.log(error);
      });
    };

    var syncFileWithLocal = function (localFile) {
      var self = this;
      angular.forEach(localFile, function(value, key) {
        if (typeof value !== 'function') {
          self[key] = value;
        }
      });
    };

    var save = function () {
      this.syncFileWithRemote();
      return localStorage.setItem(filePrefix + this.id, JSON.stringify(this));
    };

    var update = function (localFile) {
      this.syncFileWithLocal(localFile);
      this.save();
    };

    return function RemoteFile (scriptType) {
      File.call(this, scriptType);
      this.fromRemote = fromRemote;
      this.save = save;
      this.update = update;
      this.syncFileWithRemote = syncFileWithRemote;
      this.syncFileWithLocal = syncFileWithLocal;
      this.fromLocal = fromLocal;
    };
  }]);