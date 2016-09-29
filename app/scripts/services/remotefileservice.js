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

        newFile.id = file.id;
        firebaseService.createFileRef(newFile);
        newFile.author = firebaseService.userRef.id;

        return newFile;
      },

      createFromLocal: function (file) {
        var remoteFile = new RemoteFile(file.type);
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
