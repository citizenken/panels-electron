'use strict';

/**
 * @ngdoc directive
 * @name panelsApp.directive:panelsPreview
 * @description
 * # panelsPreview
 */
angular.module('panels')
  .directive('scrollElement', ['$window', function ($window) {
    return {
      restrict: 'AE',
      scope: {
        scrollAnchor: "@"
      },
      link: function postLink(scope, element) {
        var origOffset = angular.element(element).offset(),
        targetEl = angular.element(element),
        scrollEl = angular.element('snap-content');

        scrollEl.on('scroll', function (e) {
          if (scope.scrollAnchor){
            console.log(targetEl.position());
            console.log(targetEl.offset());
            if (targetEl.offset().top < 0) {
              targetEl.offset({top: 0});  
            }
          } else {
            targetEl.offset({top: 0});
          }
        });
      }
    };
  }]);
