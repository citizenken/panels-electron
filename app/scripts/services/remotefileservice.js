'use strict';

/**
 * @ngdoc service
 * @name panels.localFileService
 * @description
 * # localFileService
 * Factory in the panels.
 */
angular.module('panels')
  .factory('remoteFileService', ['RemoteFile', 'firebaseService', 'lodash',
    function (RemoteFile, firebaseService, lodash) {
    // var filePrefix = 'panelsFile_';
    return {
      create: function (file) {
        var newFile;
        if (firebaseService.files[file.id]) {
          newFile = new RemoteFile(file.type).fromRemote(firebaseService.files[file.id]);
        } else {
          newFile = new RemoteFile(file.type).fromRemote(file);
        }
        return newFile;
      },

      createFromLocal: function (file) {
        var remoteFile = new RemoteFile(file.type);
        console.log(firebaseService.files);
        return remoteFile;
      },

      getFileRemote: function (file) {
        var remoteFile;
        if (!lodash.has(firebaseService.files, file.id)) {
          remoteFile = this.create(file);
        } else {

        }
        return remoteFile;
      }
    };
  }]);
