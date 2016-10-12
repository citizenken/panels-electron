'use strict';

/**
 * @ngdoc service
 * @name panels.fileService
 * @description
 * # fileService
 * Factory in the panels.
 */
angular.module('panels')
  .factory('fileService', ['utilityService', 'localFileService', 'remoteFileService',
    'lodash', '$q', 'firebaseService', '$timeout', 'scriptService',
    function (utilityService, localFileService, remoteFileService,
      lodash, $q, firebaseService, $timeout, scriptService) {

    var fileService = {
      files: {},
      remoteFiles: {},
      currentFile: null,
      lastSave: null,
      typeDelayTimer: null,
      saved: false,

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
        this.currentFile.setWatch();
        firebaseService.setUserCurrentFile(fileId);
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
        this.lastSave = angular.copy(this.currentFile);
      },

      setCurrentFile: function () {
        if (!angular.equals({}, this.files)) {
          var lastModified = lodash.orderBy(lodash.toArray(this.files), 'modifiedOn', 'desc')[0];
          this.currentFile = lastModified;
          firebaseService.setUserCurrentFile(this.currentFile.id);
        }
      },

      compareFiles: function (file1, file2, deleteFunctions, excludeKeys) {
        var differences = [];
        angular.forEach(file1, function (value, key) {
          if (excludeKeys.indexOf(key) === -1 &&
            typeof value !== 'function' &&
            value !== file2[key]) {
            differences.push(key);
          }
        });

        return (!angular.equals([], differences)) ? differences : null;
      },

      loadFromRemote: function () {
        var self = this;
        angular.forEach(firebaseService.files, function (value) {
          value.$loaded()
          .then(function () {
            if (!lodash.has(self.files, value.id)) {
              self.createFromRemote(value)
              .then(function () {
                self.files[value.id].setWatch();
              });
            } else {
              self.files[value.id].syncFiles(value);
              self.files[value.id].setWatch();
            }
          });
        });
      },

      saveCurrentfile: function () {
        var self = this;
        if (self.typeDelayTimer) {
          $timeout.cancel(self.typeDelayTimer);
        }

        scriptService.parseCurrentFile(self.currentFile);
        self.typeDelayTimer = $timeout(function () {
          fileService.updateCurrentFile();
          self.saved = true;
          $timeout(function () {
            self.saved = false;
          }, 1000);
        }, 100);
      },

      saveOnChange: function (newVersion, oldVersion) {
        var self = this;
        // Save only when versions are not in sync, but the file is the same (so not on file change)
        if (newVersion && oldVersion &&
          newVersion.id === oldVersion.id) {

          // If there is a remote file, verify that is in not in sync too before updating
          if (self.remoteFiles &&
          self.remoteFiles[newVersion.id]) {
            if (!self.compareFiles(newVersion, self.remoteFiles[newVersion.id], true, ['history', 'modifiedOn'])) {
              if (newVersion.content !== oldVersion.content ||
                newVersion.title !== oldVersion.title) {
                self.saveCurrentfile();
              }
            }
          } else {
            if (newVersion.content !== oldVersion.content ||
              newVersion.title !== oldVersion.title) {
              self.saveCurrentfile();
            }
          }

        }
      }
    };


    return fileService;
  }]);
