'use strict';

/**
 * @ngdoc service
 * @name panels.localFileService
 * @description
 * # localFileService
 * Factory in the panels.
 */
angular.module('panels')
  .factory('localFileService', ['LocalFile', function (LocalFile) {
    var filePrefix = 'panelsFile_';
    return {
      create: function (scriptType) {
        return new LocalFile(scriptType);
      },

      getFiles: function () {
        var files = {};

        for (var key in localStorage){
          if (key.indexOf(filePrefix) > -1) {
            var file = this.revive(localStorage.getItem(key));
            files[file.id] = file;
          }
        }
        return files;
      },

      revive: function (data) {
        var origObject = JSON.parse(data),
            revived = angular.extend(new LocalFile(origObject.type), origObject);

        return revived;
      }
    };
  }]);
