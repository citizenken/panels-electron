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
        // jenky if statement to add author to a file if it hasn't been added. only runs on app load
        // there should be a better fix. There is a case when a new file syncs for the first time, 
        // it still doesn't get an author, if that file was created before firebase loaded the current user
        if ((localDifferences.indexOf('author') > -1 && localDifferences.length == 1) ||
          (remoteFile.modifiedOn > self.modifiedOn && localDifferences.length > 0)) {
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
        }
      });
    };

    var setWatch = function () {
      var self = this;
      if (self.sync && lodash.has(firebaseService.files, self.id)) {
        self.unwatch = firebaseService.files[self.id].$watch(function () {
          self.syncRemoteToLocal();
        });
      } else if (self.sync && !angular.equals({}, firebaseService)) {
        firebaseService.createFileRef(self).then(function () {
          console.log(firebaseService.loadUserFiles(firebaseService.userRef));
        });
      }
    };

    var setSync = function () {
      var self = this;
      var oldVersion = angular.copy(self);
      self.sync = true;
      self.update(oldVersion, true);
      if (lodash.has(firebaseService.files, self.id)) {
        self.syncFiles(firebaseService.files[self.id]);
      }
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
          !angular.equals(value, file2[key])) {
            if (lodash.isArray(value) && !lodash.isEmpty(value)) {
              differences.push(key);
            } else if (lodash.isObject(value) && lodash.keys(value).length >= 0) {
              differences.push(key);
            } else if (lodash.isString(value) || lodash.isBoolean(value)) {
              differences.push(key);
            }
        }
      });

      return differences;
    };

    var modifyCollaborators = function (toAdd, toRemove, toUpdate) {
      var self = this;
      var oldVersion = angular.copy(self);
      self.removeCollaborators(toRemove);
      self.updateCollaborators(toUpdate);
      self.addCollaborators(toAdd.users, toAdd.access);
      self.update(oldVersion, true);
    }

    var addCollaborators = function (collaborators, access) {
      var self = this;
      angular.forEach(collaborators, function (collab) {
        self.collaborators[collab.id] = access;
        if (lodash.has(firebaseService.userObjects, collab.id)) {
          firebaseService.updateUserCollaborator(collab.id, {file:self.id, access:access});
        }
      })
    };

    var removeCollaborators = function (userIds) {
      var self = this;
      var collabIds = lodash.keys(self.collaborators);

      angular.forEach(userIds, function (userId) {
        if (collabIds.indexOf(userId) > -1) {
          delete self.collaborators[userId];
          if (lodash.has(firebaseService.userObjects, userId)) {
            firebaseService.updateUserCollaborator(userId, null, self.id);
          }
        }
      })
    };

    var updateCollaborators = function (toUpdate) {
      var self = this;
      angular.forEach(toUpdate, function (access, userId) {
        self.collaborators[userId] = access;
        if (lodash.has(firebaseService.userObjects, userId)) {
          firebaseService.updateUserCollaborator(userId, null, null, {file:self.id, access:access});
        }        
      })
    }

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
      this.addCollaborators = addCollaborators;
      this.removeCollaborators = removeCollaborators;
      this.updateCollaborators = updateCollaborators;
      this.modifyCollaborators = modifyCollaborators;                  

      if (this.sync) {
        this.setWatch();
      }
    };
  }]);
