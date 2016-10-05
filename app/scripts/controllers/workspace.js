'use strict';

/**
 * @ngdoc function
 * @name panels.controller:WorkspaceCtrl
 * @description
 * # WorkspaceCtrl
 * Controller of the panels
 */
angular.module('panels')
  .controller('WorkspaceCtrl', ['$scope', '$rootScope', '$timeout', 'fileService', 'scriptService', 'firebaseService', 'localFileService',
    function ($scope, $rootScope, $timeout, fileService, scriptService, firebaseService, localFileService) {
    var ctrl = this;
    ctrl.editorOptions = {
        lineWrapping : true,
        lineNumbers: false,
        mode: 'comicbook',
        extraKeys: {'Ctrl-Space': 'showHints'}
    };
    ctrl.workingFile = {
      type: 'comic',
      content: null
    };
    ctrl.scriptType = 'comicbook';
    ctrl.init = init;
    ctrl.createFile = createFile;
    ctrl.focusPage = focusPage;
    ctrl.codemirrorLoaded = codemirrorLoaded;
    ctrl.typeDelayTimer = null;
    ctrl.saved = false;
    ctrl.changeTab = changeTab;
    ctrl.tab = 'edit';
    ctrl.showNavbar = false;
    ctrl.signIn = signIn;
    ctrl.syncFile = syncFile;
    ctrl.files = {};
    ctrl.setControllerFiles = setControllerFiles;
    ctrl.changeFile = changeFile;
    ctrl.saveCurrentfile = saveCurrentfile;

    function init () {
      // $timeout(firebaseService.signIn(), 500);
      if (!fileService.currentFile) {
        fileService.create(ctrl.scriptType);
        fileService.setCurrentFile();
        scriptService.createScript();
      }
      ctrl.setControllerFiles();
      scriptService.parseCurrentFile();
    }

    function setControllerFiles () {
      ctrl.workingFile = fileService.currentFile;
      ctrl.files = fileService.files;
    }

    function signIn () {
      firebaseService.signIn()
      .then(function () {
        angular.forEach(firebaseService.files, function (value, key) {
          fileService.createFromRemote(value);
        })
      });
    }

    function syncFile () {
      fileService.syncFile();
    }

    function createFile () {
      fileService.create('comicbook');
      fileService.setCurrentFile();
      ctrl.setControllerFiles();
      // scriptService.generateElementHint();
    }

    function changeFile (fileId) {
      fileService.setFile(fileId);
      ctrl.setControllerFiles();
    }

    function codemirrorLoaded (editor) {
      ctrl.editor = editor;
      editor.focus();
      console.log(editor);
    }

    function focusPage () {
      if (ctrl.editor) {
        ctrl.editor.focus();
      }
    }

    function changeTab (tab) {
      ctrl.tab = tab;
    }

    function saveCurrentfile () {
      if (ctrl.typeDelayTimer) {
        $timeout.cancel(ctrl.typeDelayTimer);
      }

      scriptService.parseCurrentFile();
      ctrl.typeDelayTimer = $timeout(function () {
        fileService.updateCurrentFile();
        ctrl.saved = true;
        $timeout(function () {
          ctrl.saved = false;
        }, 1000);
      }, 100);
    }

    ctrl.init();

    $scope.$watch(function () {
        if (ctrl.workingFile) {
            var props = {};
            angular.forEach(ctrl.workingFile, function (value, key) {
                props[key] = value;
            });
            return props;
        } else {
            return null;
        }
    }, function (newVersion, oldVersion) {
      // Save only when versions are not in sync, but the file is the same (so not on file change)
      if (newVersion && oldVersion &&
        !fileService.compareFiles(newVersion, oldVersion, true, ['history', 'modifiedOn']) &&
        newVersion.id === oldVersion.id) {

        // If there is a remote file, verify that is in not in sync too before updating
        if (fileService.remoteFiles &&
        fileService.remoteFiles[newVersion.id]) {
          if (!fileService.compareFiles(newVersion, fileService.remoteFiles[newVersion.id], true, ['history', 'modifiedOn'])) {
            if (newVersion.content !== oldVersion.content ||
              newVersion.title !== oldVersion.title) {
              ctrl.saveCurrentfile();
            }
          }
        } else {
          if (newVersion.content !== oldVersion.content ||
            newVersion.title !== oldVersion.title) {
            ctrl.saveCurrentfile();
          }
        }

      }
    }, true);
  }]);
