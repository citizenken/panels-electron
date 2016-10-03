'use strict';

/**
 * @ngdoc service
 * @name panels.localFile
 * @description
 * # fileService
 * Factory in the panels.
 */
angular.module('panels')
  .factory('LocalFile', ['File', 'firebaseService', 'lodash', '$q',
    function (File, firebaseService, lodash, $q) {
    var filePrefix = 'panelsFile_';

    var syncFileWithRemote = function (event, data) {
      console.log(event, data);
      var self = this,
      excludeKeys = ['history', 'modifiedOn'],
      firebaseFile = firebaseService.files[self.id];
      return firebaseFile.$loaded(function (remoteFile) {
        return self.getDifferences(excludeKeys)
        .then(function (differences) {
          angular.forEach(differences, function (value) {
            if (self.modifiedOn > remoteFile.modifiedOn) {
              remoteFile[value] = self[value];
            } else {
              self[value] = remoteFile[value];
            }
          });

          if (differences.length > 0) {
            return remoteFile.$save();
          } else {
            return $q.reject();
          }
        });
      });





      // firebaseFile = firebaseService.files[self.id];
      // return firebaseFile.$loaded()
      // .then(function (file) {
      //   // Insert logic to check modified on date
      //   if (lodash.has(file, 'modifiedOn') && file.modifiedOn > self.modifiedOn) {
      //     angular.forEach(file, function (value, key) {
      //       if (key[0] !== '$') {
      //         self[key] = value;
      //       }
      //     });

      //   } else {
      //     angular.forEach(self, function (value, key) {
      //       if (typeof value !== 'function') {
      //         file[key] = value;
      //       }
      //     });

      //   }

      //   return file.$save();
      // });
    };

    var setSync = function () {
      var self = this;
      self.sync = true;
      self.unwatch = firebaseService.files[self.id].$watch(function () {
        self.syncFileWithRemote(self);
      });
      self.save();
    };

    var save = function () {
      var self = this;
      if (self.sync) {
        self.syncFileWithRemote();
      }
      return localStorage.setItem(filePrefix + this.id, JSON.stringify(this));
    };

    var getDifferences = function (excludeKeys) {
      var self = this,
      remote = firebaseService.files[self.id];
      return remote.$loaded(function (remoteFile) {
        var differences = [];
        angular.forEach(self, function (value, key) {
          if (excludeKeys.indexOf(key) === -1 &&
            typeof value !== 'function' &&
            value.length > 0 &&
            value !== remoteFile[key]) {
            differences.push(key);
          }
        });

        if (!angular.equals([], differences)) {
          return $q.resolve(differences);
        } else {
          return $q.reject(null);
        }

      });
    };

    return function LocalFile (scriptType) {
      File.call(this, scriptType);
      this.save = save;
      this.unwatch = null;
      this.syncFileWithRemote = syncFileWithRemote;
      this.setSync = setSync;
      this.getDifferences = getDifferences;
    };
  }]);
