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
    'ui.bootstrap',
    'firebase'
  ])
  .config(['snapRemoteProvider', function (snapRemoteProvider) {
    var config = {
      apiKey: 'AIzaSyBFM-2jOMfbeB0gOw_Xi2WQkhBg8GTqsIQ',
      authDomain: 'panels-fd87e.firebaseapp.com',
      databaseURL: 'https://panels-fd87e.firebaseio.com',
      storageBucket: 'panels-fd87e.appspot.com',
    };
    window.firebase.initializeApp(config);
    snapRemoteProvider.globalOptions.touchToDrag = false;
  }])
  .run(['firebaseService', function (firebaseService) {
    if (firebaseService.auth.$getAuth()) {
      console.log('foo');
    }
  }])
  .run(['hintService', function (hintService) {
    window.CodeMirror.registerHelper('hint', 'script', function(cm) {
      var cursorHead = cm.getCursor(),
          lastCursor = angular.copy(cursorHead),
          hintList, hints;

      lastCursor.ch = 0;
      var query = cm.getRange(lastCursor, cursorHead);

      hintList = hintService.generateElementHint(query);
      hints = {from: cm.getCursor(), to: cm.getCursor(), list: hintList};
      return hints;
    });

    window.CodeMirror.commands.showHints = function(cm) {
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
