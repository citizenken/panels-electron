'use strict';

/**
 * @ngdoc service
 * @name panels.localFile
 * @description
 * # fileService
 * Factory in the panels.
 */
angular.module('panels')
  .factory('LocalFile', ['File', 'firebaseService', 'lodash', '$q', 'watcherService',
    function (File, firebaseService, lodash, $q, watcherService) {
    var filePrefix = 'panelsFile_';

    var syncFiles = function (remoteFile) {
      var self = this;

      if (remoteFile.modifiedOn > self.modifiedOn) {
        self.syncRemoteToLocal();
      } else if (remoteFile.modifiedOn < self.modifiedOn) {
        self.syncLocalToRemote();
      }
    };

    var syncRemoteToLocal = function () {
      var self = this,
      oldVersion = angular.copy(self),
      excludeKeys = ['history', 'modifiedOn'],
      firebaseFile = firebaseService.files[self.id];
      return firebaseFile.$loaded()
      .then(function (remoteFile) {
        var localDifferences = self.getDifferences(remoteFile, self, excludeKeys);
        var toCopy = localDifferences.concat(excludeKeys);
        if (remoteFile.modifiedOn > self.modifiedOn && localDifferences.length > 0) {
          watcherService.disable('currentFileUpdate');
          angular.forEach(toCopy, function (value) {
            self[value] = remoteFile[value];
          });
          self.update(oldVersion, false);
          watcherService.enable(null, 'currentFileUpdate');
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    };

    var syncLocalToRemote = function () {
      var self = this,
      excludeKeys = ['history', 'modifiedOn'],
      firebaseFile = firebaseService.files[self.id];
      return firebaseFile.$loaded(function (remoteFile) {
        var remoteDifferences = self.getDifferences(self, remoteFile, excludeKeys),
        toCopy = remoteDifferences.concat(excludeKeys);
        if (remoteDifferences.length > 0) {
          angular.forEach(toCopy, function (value) {
            remoteFile[value] = self[value];
          });

          return remoteFile.$save();
        } else {
          return $q.reject();
        }
      });
    };

    var setWatch = function () {
      var self = this;
      if (self.sync && lodash.has(firebaseService.files, self.id)) {
        self.unwatch = firebaseService.files[self.id].$watch(function () {
          self.syncRemoteToLocal();
        });
        self.update();
      } else if (self.sync) {
        firebaseService.createFileRef(self).then(function () {
          console.log(firebaseService.loadUserFiles(firebaseService.userRef));
        });
      }
    };

    var setSync = function () {
      var self = this;
      self.sync = true;
      self.setWatch();
    };

    var save = function (sync) {
      var self = this;
      sync = (typeof sync === 'undefined') ? true : sync;
      if (sync && self.sync && lodash.has(firebaseService.files, self.id)) {
        self.syncLocalToRemote();
      }
      return localStorage.setItem(filePrefix + this.id, JSON.stringify(this));
    };

    var getDifferences = function (file1, file2, excludeKeys) {
      var differences = [];
      angular.forEach(file1, function (value, key) {
        if (excludeKeys.indexOf(key) === -1 &&
          !lodash.isFunction(value) &&
          value !== file2[key]) {
            if (lodash.isArray(value) && !lodash.isEmpty(value)) {
              differences.push(key);
            } else if (lodash.isObject(value) && lodash.keys(value).length > 0) {
              differences.push(key);
            } else if (lodash.isString(value)) {
              differences.push(key);
            }
        }
      });

      return differences;
    };

    return function LocalFile (scriptType) {
      File.call(this, scriptType);
      this.save = save;
      this.unwatch = null;
      this.syncRemoteToLocal = syncRemoteToLocal;
      this.syncLocalToRemote = syncLocalToRemote;
      this.setWatch = setWatch;
      this.setSync = setSync;
      this.setWatch = setWatch;
      this.syncFiles = syncFiles;
      this.syncRemoteToLocal = syncRemoteToLocal;
      this.syncLocalToRemote = syncLocalToRemote;
      this.getDifferences = getDifferences;

      if (this.sync) {
        this.setWatch();
      }
    };
  }]);
