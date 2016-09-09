'use strict';

/**
 * @ngdoc service
 * @name panels.localfile
 * @description
 * # localfile
 * Factory in the panels.
 */
angular.module('panels')
  .factory('localfile', function () {
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
