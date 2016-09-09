'use strict';

/**
 * @ngdoc service
 * @name panels.remotefile
 * @description
 * # remotefile
 * Factory in the panels.
 */
angular.module('panels')
  .factory('remotefile', function () {
    // Service logic
    // ...

    var meaningOfLife = 42;

    // Public API here
    return {
      someMethod: function () {
        return meaningOfLife;
      }
    };
  });
