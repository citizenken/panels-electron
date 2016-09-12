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
    var save = function () {
      return localStorage.setItem(filePrefix + this.id, JSON.stringify(this));
    };

    return function LocalFile (scriptType) {
      File.call(this, scriptType);
      this.save = save;
    };
  }]);
