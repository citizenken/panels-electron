'use strict';

/**
 * @ngdoc service
 * @name panelsApp.utilityService
 * @description
 * # utilityService
 * Factory in the panelsApp.
 */
angular.module('panels')
  .factory('utilityService', function () {
    return {
      generateRandomId: function (length) {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for(var i=0; i < length; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
      },
    };
  });
