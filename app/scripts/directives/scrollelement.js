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
        scrollAnchor: "@"
      },
      link: function postLink(scope, element) {
        var origOffset = angular.element(element).offset(),
        origPosition = angular.element(element).position(),
        targetEl = angular.element(element),
        scrollEl = angular.element('snap-content');

        function resetPosition () {
          targetEl.css('top', '0px');
        }

        scrollEl.on('scroll', function (e) {
          if (scope.scrollAnchor){
            if (targetEl.offset().top < 0) {
              targetEl.offset({top: 0});  
            } else if (targetEl.position().top > origPosition.top) {
              targetEl.offset({top: 0});
            } else if (targetEl.position().top < origPosition.top) {
              resetPosition();
            }
          } else {
            targetEl.offset({top: 0});
          }
        });

        $rootScope.$on('onFocus', resetPosition);
      }
    };
  }]);
