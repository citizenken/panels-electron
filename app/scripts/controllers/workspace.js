'use strict';

/**
 * @ngdoc function
 * @name panels.controller:WorkspaceCtrl
 * @description
 * # WorkspaceCtrl
 * Controller of the panels
 */
angular.module('panels')
  .controller('WorkspaceCtrl', function () {
    var ctrl = this;
    ctrl.editorOptions = {
        lineWrapping : true,
        lineNumbers: false
    };
    ctrl.file = {
      content: null
    };
  });
