'use strict';

/**
 * @ngdoc service
 * @name panels.fileService
 * @description
 * # fileService
 * Factory in the panels.
 */
angular.module('panels')
  .factory('fileService', ['utilityService', 'localFileService', 'remoteFileService', 'lodash', '$q', 'firebaseService',
    function (utilityService, localFileService, remoteFileService, lodash, $q, firebaseService) {

    var fileService = {
      files: {},
      remoteFiles: {},
      currentFile: null,
      lastSave: null,
      create: function (scriptType) {
        // var newFile = new File(scriptType);

        // TODO: add logic to determine if connected to remote storage

        var newFile = localFileService.create(scriptType);
        newFile.save();
        this.files[newFile.id] = newFile;
        return newFile;
      },

      createFromRemote: function (remoteFile) {
        var self = this;
        return localFileService.fromRemote(remoteFile)
        .then(function (newFile) {
          self.files[newFile.id] = newFile;
          return $q.resolve(newFile);
        });
      },

      setFile: function (fileId) {
        this.currentFile = this.files[fileId];
      },

      setSync: function (fileId) {
        this.files[fileId].setSync();
      },

      syncLocalAndRemote: function (local, remote) {
        if (local.modifiedOn >= remote.modifiedOn) {
          remote.syncFileWithLocal(local);
        } else if (remote.modifiedOn > local.modifiedOn) {
          local.syncFileWithRemote(remote);
        }
      },

      unsetSync: function (fileId) {
        var file = this.files[fileId];
        file.sync = false;
        if (this.remoteFiles[file.id]) {
          delete this.remoteFiles[file.id];
        }
        file.save();
      },

      loadFiles: function () {
        // TODO: add logic to determine if connected to remote storage

        this.files = localFileService.getFiles();
      },

      updateCurrentFile: function () {
        this.currentFile.update(this.lastSave);
        // if (this.currentFile.sync) {
        //   this.remoteFiles[this.currentFile.id].update(this.currentFile);
        // }
        this.lastSave = angular.copy(this.currentFile);
      },

      setCurrentFile: function () {
        if (!angular.equals({}, this.files)) {
          var lastModified = lodash.orderBy(lodash.toArray(this.files), 'modifiedOn', 'desc')[0];
          this.currentFile = lastModified;
        }
      },

      compareFiles: function (file1, file2, deleteFunctions, excludeKeys) {
        // var copy1 = angular.copy(file1),
        // copy2 = angular.copy(file2);
        var differences = [];
        angular.forEach(file1, function (value, key) {
          if (excludeKeys.indexOf(key) === -1 &&
            typeof value !== 'function' &&
            value !== file2[key]) {
            differences.push(key);
          }
        });

        // angular.forEach(copy1, function (value, key) {
        //   if (typeof value === 'function') {
        //     delete copy1[key];
        //   }
        // });

        // angular.forEach(copy2, function (value, key) {
        //   if (typeof value === 'function') {
        //     delete copy2[key];
        //   }
        // });

        // angular.forEach(copy1, function (value, key) {
        //   if ()
        // });

        return (!angular.equals([], differences)) ? differences : null;
      },

      // updateFilesOnRemoteChange: function (updatedFiles) {
      //   var self = this,
      //   id = self.currentFile.id,
      //   remoteFirebaseFile = remoteFileService.create(updatedFiles[id]);

      //   // compare firebase version to local and remote files
      //   if (!self.compareFiles(self.currentFile, remoteFirebaseFile, true, ['history', 'modifiedOn']) &&
      //     self.remoteFiles &&
      //     lodash.has(self.remoteFiles, id) &&
      //     !self.compareFiles(remoteFirebaseFile, self.remoteFiles[id], true, ['history', 'modifiedOn'])) {
      //       self.remoteFiles[id].syncFileWithRemote()
      //       .then(function () {
      //         self.syncLocalAndRemote(self.files[id], self.remoteFiles[id]);
      //       });
      //   }
      // }
      loadFromRemote: function (files) {
        var self = this;
        angular.forEach(files, function (value) {
          value.$loaded()
          .then(function () {
            if (!lodash.has(self.files, value.id)) {
              self.createFromRemote(value)
              .then(function () {
                self.files[value.id].setWatch();
              });
            } else {
              self.files[value.id].syncFiles(value);
            }
          });
        });
      }
    };



    // $rootScope.$watch(function () {
    //   if (!angular.equals({}, firebaseService.files)) {
    //     return firebaseService.files;
    //   } else {
    //     return null;
    //   }
    // }, function (updatedFiles) {
    //   if (updatedFiles) {
    //     fileService.updateFilesOnRemoteChange(updatedFiles);
    //   }
    // }, true);

    return fileService;
  }]);
