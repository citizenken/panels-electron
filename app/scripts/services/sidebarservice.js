'use strict';

/**
 * @ngdoc service
 * @name panelsElectronApp.codemirrorService
 * @description
 * # codemirrorService
 * Factory in the panelsElectronApp.
 */

angular.module('panels')
  .factory('sidebarService', ['$rootScope', function ($rootScope) {
    var sidebarService = {
      sidebarStatus: 'closed'
    };

   $rootScope.$on('snapEvent', function (e, d) {
      sidebarService.sidebarStatus = d;
    });


    return sidebarService;
  }]);
