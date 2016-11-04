'use strict';

/**
 * @ngdoc service
 * @name panelsElectronApp.onlineService
 * @description
 * # onlineService
 * Factory in the panelsElectronApp.
 */
angular.module('panels')
  .factory('onlineService', ['$window', '$rootScope', function ($window, $rootScope) {
    var service = {
      online: null,
      updateOnlineStatus: function () {
        this.online = navigator.onLine;
        $rootScope.$emit('onlineStatusChange', this.online);
      },

      init: function () {
        var self = this;
        self.online = navigator.onLine;
      }
    };

    service.updateOnlineStatus();
    window.addEventListener('online',  service.updateOnlineStatus);
    window.addEventListener('offline', service.updateOnlineStatus);

    return service;
  }]);
