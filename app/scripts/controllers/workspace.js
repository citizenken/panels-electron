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
    'firebaseService', 'watcherService', 'lodash', 'onlineService', 'codemirrorService', 'utilityService',
    function ($scope, $rootScope, $timeout, fileService, scriptService,
      firebaseService, watcherService, lodash, onlineService, codemirrorService, utilityService) {
    var ctrl = this;
    ctrl.editorOptions = {
        lineWrapping : true,
        lineNumbers: false,
        singleCursorHeightPerLine: false,
        mode: 'vanlente-comicbook',
        extraKeys: {'Ctrl-Space': 'showHints'}
    };
    ctrl.workingFile = {
      type: 'comic',
      content: null
    };

    ctrl.online = null;
    ctrl.user = null;
    ctrl.scriptType = 'comicbook';
    ctrl.init = init;
    ctrl.codemirrorLoaded = codemirrorLoaded;
    ctrl.typeDelayTimer = null;
    ctrl.saved = false;
    ctrl.changeTab = changeTab;
    ctrl.tab = 'edit';
    ctrl.showNavbar = false;
    ctrl.syncFile = syncFile;
    ctrl.files = {};
    ctrl.setControllerFiles = setControllerFiles;
    ctrl.changeFile = changeFile;
    ctrl.loadFiles = loadFiles;
    ctrl.doBlur = doBlur;
    ctrl.snapState = 'closed';
    ctrl.pageslideOpen = null;
    ctrl.togglePageslide = togglePageslide;
    ctrl.showPageslide = showPageslide;


    function init () {
      ctrl.showPageslide();
      ctrl.online = onlineService.online;
      fileService.loadFiles();
      if (!angular.equals(firebaseService, {})) {
        firebaseService.rootRefObject.$loaded().then(function () {
          firebaseService.signIn()
          .then(fileService.loadFromRemote.bind(fileService))
          .then(firebaseService.loadUsers.bind(firebaseService))
          .then(ctrl.loadFiles);
        })
        .catch(function () {
          ctrl.loadFiles();
        })
      } else {
        ctrl.loadFiles();
      }


    }

    function loadFiles () {
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
      if (!angular.equals({}, firebaseService) &&
        firebaseService.userRef !== null) {
        codemirrorService.showAllUserCursors();
      }
    }

    function doBlur ($event) {
      $event.target.blur();
    }

    function syncFile () {
      fileService.syncFile();
    }

    function changeFile (fileId) {
      fileService.setFile(fileId);
      ctrl.setControllerFiles();
    }

    function codemirrorLoaded (editor) {
      codemirrorService.editor = editor;
      codemirrorService.registerListeners();
    }

    function showPageslide () {
      ctrl.pageslideOpen = (utilityService.getLocalStorageKey('pageslideOpen') == "true") || false;
    }

    function togglePageslide () {
      ctrl.pageslideOpen = !ctrl.pageslideOpen;
      utilityService.setLocalStorageKey('pageslideOpen', ctrl.pageslideOpen);
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

    $rootScope.$on('onlineStatusChange', function (e, d) {
      ctrl.online = d;
      $scope.$apply();
    });

    watcherService.enable($scope, 'showSaveStatus');

    $rootScope.$on('snapEvent', function (e, d) {
      ctrl.snapState = d;
      $scope.$apply();
    });

    $rootScope.$on('signedIn', ctrl.loadFiles);
    $rootScope.$on('filedCreated', ctrl.setControllerFilese);
  }]);
