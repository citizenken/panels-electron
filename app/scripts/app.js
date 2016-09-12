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
    'puElasticInput',
    'snap',
    'ngLodash',
    'ui.bootstrap'
  ])
  .run(['fileService', 'scriptService', function (fileService, scriptService) {
    fileService.loadFiles();
    fileService.setCurrentFile();
    scriptService.createScript();
    window.CodeMirror.registerHelper('hint', 'script', function(cm) {
      var cursorHead = cm.getCursor(),
          lastCursor = angular.copy(cursorHead),
          hintList, hints;

      lastCursor.ch = 0;
      var query = cm.getRange(lastCursor, cursorHead);

      hintList = scriptService.generateElementHint(query);
      hints = {from: cm.getCursor(), to: cm.getCursor(), list: hintList};
      return hints;
    });

    window.CodeMirror.commands.autocomplete = function(cm) {
      cm.showHint({hint: window.CodeMirror.hint.script});
    };
  }])
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
