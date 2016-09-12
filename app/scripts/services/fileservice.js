'use strict';

/**
 * @ngdoc service
 * @name panels.fileService
 * @description
 * # fileService
 * Factory in the panels.
 */
angular.module('panels')
  .factory('fileService', ['utilityService', 'localFileService', 'lodash',
    function (utilityService, localFileService, lodash) {
    // Public API here
    return {
      files: {},
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
          console.log(lastModified.id);
        }
      }
    };
  }]);
