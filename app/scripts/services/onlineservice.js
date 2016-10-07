'use strict';

/**
 * @ngdoc service
 * @name panelsElectronApp.onlineService
 * @description
 * # onlineService
 * Factory in the panelsElectronApp.
 */
angular.module('panels')
  .factory('onlineService', ['$window', function ($window) {
    var onlineService = {
      onlineStatus: null
    };

    $window.addEventListener('load', function() {
      if (navigator.onLine) {
        console.log('We\'re online!');
      } else {
        console.log('We\'re offline...');
      }
    }, false);

    $window.addEventListener('online', function() {
      onlineService.onlineStatus = 'online';
      console.log('And we\'re back :).');
    }, false);

    $window.addEventListener('offline', function() {
      onlineService.onlineStatus = 'offline';
      console.log('Connection is down.');
    }, false);

    return onlineService;
  }]);
