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
      type: 'comic',
      content: null
    };
    ctrl.focusPage = focusPage;
    ctrl.codemirrorLoaded = codemirrorLoaded;

    // function init () {

    // },

    function codemirrorLoaded (editor) {
      ctrl.editor = editor;
      editor.focus();
    }

    function focusPage () {
      if (ctrl.editor) {
        ctrl.editor.focus();
      }
    }

  });
