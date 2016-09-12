'use strict';

/**
 * @ngdoc service
 * @name panels.remoteFile
 * @description
 * # remoteFile
 * Factory in the panels.
 */
angular.module('panels')
  .factory('RemoteFile', ['File', function (File) {
    return function (scriptType) {
      File.call(this, scriptType);
      this.someFunc = function () {console.log('some remote func');};
    };
  }]);
