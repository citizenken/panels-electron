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

    var syncRemoteToLocal = function () {
      var self = this,
      oldVersion = angular.copy(self),
      excludeKeys = ['history', 'modifiedOn'],
      firebaseFile = firebaseService.files[self.id];
      return firebaseFile.$loaded(function (remoteFile) {
        return self.getDifferences(excludeKeys)
        .then(function (differences) {
          if (remoteFile.modifiedOn > self.modifiedOn) {
            angular.forEach(differences, function (value) {
              self[value] = remoteFile[value];
            });
          }

          if (differences.length > 0) {
            self.update(oldVersion, false);
          }
        });
      });
    };

    var syncLocalToRemote = function () {
      var self = this,
      excludeKeys = ['history', 'modifiedOn'],
      firebaseFile = firebaseService.files[self.id];
      return firebaseFile.$loaded(function (remoteFile) {
        return self.getDifferences(excludeKeys)
        .then(function (differences) {
          angular.forEach(differences, function (value) {
            remoteFile[value] = self[value];
          });

          if (differences.length > 0) {
            return remoteFile.$save();
          } else {
            return $q.reject();
          }
        });
      });
    };    

    var setWatch = function () {
      if (lodash.has(firebaseService.files, self.id)) {
        self.unwatch = firebaseService.files[self.id].$watch(function () {
          self.syncRemoteToLocal();
        });
      }
    }

    var setSync = function () {
      var self = this;
      self.sync = true;
      self.setWatch();
      self.update();
    };

    var save = function (sync) {
      var self = this;
      if (sync && self.sync && lodash.has(firebaseService.files, self.id)) {
        self.syncLocalToRemote();
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
      this.syncRemoteToLocal = syncRemoteToLocal;
      this.syncLocalToRemote = syncLocalToRemote;
      this.setWatch = setWatch;
      this.setSync = setSync;
      this.getDifferences = getDifferences;
    };
  }]);
