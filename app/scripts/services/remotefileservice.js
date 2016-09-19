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
        return new RemoteFile(file.type).fromRemote(file);
      },

      createFromLocal: function (file) {
        var foo = new RemoteFile(file.type).fromLocal(file);
        console.log(firebaseService.files);
        return foo;
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
