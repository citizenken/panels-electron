'use strict';

/**
 * @ngdoc service
 * @name panelsElectronApp.watcherService
 * @description
 * # watcherService
 * Service in the panelsElectronApp.
 */
angular.module('panels')
  .factory('watcherService', function () {
    var watchService = {
        watchers: {},
        create: function(name, toWatch, callback, deepWatch, $scope){

            watchService.watchers[name] = {
                'toWatch': toWatch,
                'callback': callback,
                'deepWatch': deepWatch,
                '$scope': $scope,
                'disableCallback': null
            };
        },
        enable: function($scope, name){
            if (typeof watchService.watchers[name].callback !== 'function'){
                return;
            }
            watchService.disable(name);
            var watcher = watchService.watchers[name].callback,
            watch = watchService.watchers[name].toWatch,
            deep = watchService.watchers[name].deepWatch;
            if ($scope) {
              watchService.watchers[name].disableCallback = $scope.$watch(watch, watcher, deep);
            } else {
              watchService.watchers[name].disableCallback = watchService.watchers[name].$scope.$watch(watch, watcher, deep);
            }


        },
        disable: function(name){
            if (typeof watchService.watchers[name].disableCallback !== 'function'){
                return;
            }
            watchService.watchers[name].disableCallback();
        }
    };

    return watchService;
  });
