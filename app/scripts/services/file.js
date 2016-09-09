'use strict';

/**
 * @ngdoc service
 * @name panels.file
 * @description
 * # file
 * Factory in the panels.
 */
angular.module('panels')
  .factory('file', function () {
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
