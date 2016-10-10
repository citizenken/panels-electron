'use strict';

/**
 * @ngdoc function
 * @name panels.controller:WorkspaceCtrl
 * @description
 * # WorkspaceCtrl
 * Controller of the panels
 */
angular.module('panels')
  .controller('WorkspaceCtrl', ['$scope', '$rootScope', '$timeout', 'fileService', 'scriptService',
    'firebaseService', 'watcherService', 'lodash', 'onlineService', 'codemirrorService',
    function ($scope, $rootScope, $timeout, fileService, scriptService,
      firebaseService, watcherService, lodash, onlineService, codemirrorService) {
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
    ctrl.loadFiles = loadFiles;

    function init () {
      if (onlineService.online && firebaseService.hasFirebaseAuthStored()) {
        firebaseService.signIn()
        .then(fileService.loadFromRemote.bind(fileService))
        .then(firebaseService.loadUsers.bind(firebaseService))
        .then(ctrl.loadFiles);
      } else {
        ctrl.loadFiles();
      }
    }

    function loadFiles () {
      fileService.loadFiles();
      fileService.setCurrentFile();
      if (!fileService.currentFile) {
        fileService.create(ctrl.scriptType);
        fileService.setCurrentFile();
        scriptService.createScript(fileService.currentFile);
      }
      ctrl.setControllerFiles();
      scriptService.parseCurrentFile(fileService.currentFile);
    }

    function setControllerFiles () {
      ctrl.workingFile = fileService.currentFile;
      ctrl.files = fileService.files;
    }

    function signIn () {
      firebaseService.signIn()
      .then(fileService.loadFromRemote.bind(fileService));
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
      codemirrorService.editor = editor;
      codemirrorService.registerListeners();
      codemirrorService.editor.focus();
    }

    function focusPage () {
      if (codemirrorService.editor) {
        codemirrorService.editor.focus();
      }
    }

    function changeTab (tab) {
      ctrl.tab = tab;
    }

    ctrl.init();


    watcherService.create('currentFileUpdate', function () {
        if (ctrl.workingFile) {
            var props = {};
            angular.forEach(ctrl.workingFile, function (value, key) {
                props[key] = value;
            });
            return props;
        } else {
            return null;
        }
    }, fileService.saveOnChange.bind(fileService), true, $scope);

    watcherService.enable($scope, 'currentFileUpdate');

    watcherService.create('showSaveStatus', function () {
      return fileService.saved;
    }, function (saved) {
      ctrl.saved = saved;
    });

    watcherService.enable($scope, 'showSaveStatus');
  }]);
