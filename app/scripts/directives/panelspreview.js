'use strict';

/**
 * @ngdoc directive
 * @name panelsApp.directive:panelsPreview
 * @description
 * # panelsPreview
 */
angular.module('panels')
  .directive('panelsPreview', ['$rootScope', 'scriptService', function ($rootScope, scriptService) {
    return {
      restrict: 'AE',
      link: function postLink(scope, element) {
        function renderScript () {
          var renderer = new window.Renderer(scriptService.script, element);
          element.empty();
          element.append(renderer.renderElements());
        }

        $rootScope.$on('renderScript', renderScript);
      }
    };
  }]);
