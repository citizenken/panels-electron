'use strict';

/**
 * @ngdoc directive
 * @name panelsApp.directive:panelsPreview
 * @description
 * # panelsPreview
 */
angular.module('panels')
  .directive('scrollElement', ['$window', '$rootScope', function ($window, $rootScope) {
    return {
      restrict: 'AE',
      scope: {
        scrollAnchor: '@'
      },
      link: function postLink(scope, element) {
        var origPosition = angular.element(element).position(),
        targetEl = angular.element(element),
        scrollEl = angular.element('body');

        function resetPosition () {
          targetEl.css('top', '0px');
        }

        scrollEl.on('scroll', function () {
          if (scope.scrollAnchor){
            if (targetEl.offset().top < 0) {
              targetEl.offset({top: 0});
            } else if (targetEl.position().top > origPosition.top) {
              targetEl.offset({top: 0});
            } else if (targetEl.position().top < origPosition.top) {
              resetPosition();
            }
          } else {

            if (targetEl.position().top < 0) {
              resetPosition();
            } else {
              targetEl.offset({top: 0});
            }
          }
        });

        $rootScope.$on('onFocus', resetPosition);
      }
    };
  }]);
