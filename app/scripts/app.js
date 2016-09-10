'use strict';

/**
 * @ngdoc overview
 * @name panels
 * @description
 * # panels
 *
 * Main module of the application.
 */
angular
  .module('panels', [
    'ngAnimate',
    'ngResource',
    'ngRoute',
    'ui.codemirror',
    'puElasticInput'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/workspace.html',
        controller: 'WorkspaceCtrl',
        controllerAs: 'workspace'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
