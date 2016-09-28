'use strict';

/**
 * @ngdoc service
 * @name panels.localFile
 * @description
 * # fileService
 * Factory in the panels.
 */
angular.module('panels')
  .factory('LocalFile', ['File', function (File) {
    var filePrefix = 'panelsFile_';

    var syncFileWithRemote = function (remoteFile) {
      var self = this;
      angular.forEach(remoteFile, function(value, key) {
        if (typeof value !== 'function') {
          self[key] = value;
        }
      });
    };

    var save = function () {
      return localStorage.setItem(filePrefix + this.id, JSON.stringify(this));
    };

    return function LocalFile (scriptType) {
      File.call(this, scriptType);
      this.save = save;
      this.syncFileWithRemote = syncFileWithRemote;
    };
  }]);
