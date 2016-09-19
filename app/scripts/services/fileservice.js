'use strict';

/**
 * @ngdoc service
 * @name panels.fileService
 * @description
 * # fileService
 * Factory in the panels.
 */
angular.module('panels')
  .factory('fileService', ['utilityService', 'localFileService', 'remoteFileService', 'lodash',
    function (utilityService, localFileService, remoteFileService, lodash) {
    // Public API here
    return {
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

      syncFile: function (file) {
        file = this.currentFile;
        file.sync = true;
        var remoteFile;
        if (!lodash.has(this.remoteFiles, file.id)) {
          remoteFile = remoteFileService.createFromLocal(file);
          this.remoteFiles[file.id] = remoteFile;
        } else {
          remoteFile = this.remoteFiles[file.id];
        }
        remoteFile.save();
        file.save();
        console.log(this.files, this.remoteFiles);
      },

      loadFiles: function () {
        // TODO: add logic to determine if connected to remote storage

        this.files = localFileService.getFiles();
      },

      updateCurrentFile: function () {
        this.currentFile.update(this.lastSave);
        if (this.currentFile.sync) {
          this.remoteFiles[this.currentFile.id].update(this.currentFile);
        }
        this.lastSave = angular.copy(this.currentFile);
      },

      setCurrentFile: function () {
        if (!angular.equals({}, this.files)) {
          var lastModified = lodash.orderBy(lodash.toArray(this.files), 'modifiedOn', 'desc')[0];
          this.currentFile = lastModified;
        }
      }
    };
  }]);
