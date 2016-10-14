'use strict';

/**
 * @ngdoc directive
 * @name panelsApp.directive:panelsPreview
 * @description
 * # panelsPreview
 */
angular.module('panels')
  .directive('snapEvent', function($rootScope, snapRemote) {
    return {
      link: function() {
        snapRemote.getSnapper().then(function(snapper) {
          snapper.on('animated', function() {
            $rootScope.$broadcast('snapEvent', snapper.state().state);
          });
        });
      }
    };
  });
