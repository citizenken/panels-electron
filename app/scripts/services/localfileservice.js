'use strict';

/**
 * @ngdoc service
 * @name panels.localFileService
 * @description
 * # localFileService
 * Factory in the panels.
 */
angular.module('panels')
  .factory('localFileService', ['LocalFile', '$q', function (LocalFile, $q) {
    var filePrefix = 'panelsFile_';
    return {
      create: function (scriptType) {
        return new LocalFile(scriptType);
      },

      getFiles: function () {
        var files = {};

        for (var key in localStorage){
          if (key.indexOf(filePrefix) > -1) {
            var file = this.reviveFromJson(localStorage.getItem(key));
            files[file.id] = file;
          }
        }
        return files;
      },

      fromRemote: function (remoteFile) {
        var self = this,
        file = {};
        return remoteFile.$loaded()
        .then(function () {
          angular.forEach(remoteFile, function (value, key) {
            if (key[0] !== '$' &&
              typeof value !== 'function') {
              file[key] = value;
            }
          });
          console.log(self.revive(file));
          return $q.resolve(self.revive(file));
        });
      },

      revive: function (file) {
        return angular.extend(new LocalFile(file.type), file);
      },

      reviveFromJson: function (data) {
        var self = this;
        return self.revive(JSON.parse(data));
      }
    };
  }]);
