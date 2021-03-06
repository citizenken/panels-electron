'use strict';

/**
 * @ngdoc function
 * @name panelsElectronApp.controller:SidebarCtrl
 * @description
 * # SidebarCtrl
 * Controller of the panelsElectronApp
 */
angular.module('panels')
  .controller('SidebarCtrl', [ '$scope', '$rootScope', 'fileService', 'firebaseService',
    '$uibModal', 'printService', 'oauthService', 'codemirrorService',
    function ($scope, $rootScope, fileService, firebaseService, $uibModal, printService, oauthService, codemirrorService) {
    var ctrl = this;
    ctrl.showHistory = showHistory;
    ctrl.inspectHistory = null;
    ctrl.showDetail = showDetail;
    ctrl.detail = null;
    ctrl.setSync = setSync;
    ctrl.signOut = signOut;
    ctrl.signIn = signIn;
    ctrl.user = null;
    ctrl.openAccordion = {};
    ctrl.users = null;
    ctrl.fileSync = {};
    ctrl.scriptTypes = [
      'comicbook',
      'movie',
      'TV'
    ]
    ctrl.newScriptType
    ctrl.selectNewScript = selectNewScript;
    ctrl.createFile = createFile;
    ctrl.deleteFile = deleteFile;
    ctrl.shareScript = shareScript;
    ctrl.printDocument = printDocument;
    ctrl.scriptElements = codemirrorService.getAllTokens();
    ctrl.cursorToken = null;
    ctrl.activeTab = 0;
    ctrl.insertTemplate = insertTemplate;
    ctrl.nextElement = null;
    // ctrl.showDetailModel = showDetailModel;

    function showHistory (file) {
      ctrl.inspectHistory  = file;
    }

    function deleteFile (fileId) {
      fileService.files[fileId].deleted = true;
      fileService.files[fileId].update(null, fileService.files[fileId].sync);
    }

    function createFile () {
      fileService.create(ctrl.newScriptType);
      fileService.setCurrentFile();
      $rootScope.$emit('filedCreated')
      ctrl.newScriptType = null;
      // scriptService.generateElementHint();
    }

    function signIn () {
      firebaseService.signIn()
      .then(function (user) {
        ctrl.user = user;
      })
      .then(fileService.loadFromRemote.bind(fileService))
      .then(firebaseService.loadUsers.bind(firebaseService));
    }

    function signOut () {
      ctrl.user = null;
      firebaseService.auth.$signOut();
      oauthService.logOut();
    }

    function setSync (fileId) {
      if (fileService.files[fileId].sync) {
        fileService.setSync(fileId);
      } else {
        fileService.unsetSync(fileId);
      }
    }

    function showDetail (fileId) {
      var file = fileService.files[fileId];
      ctrl.detailModal = $uibModal.open({
        templateUrl: 'views/detailModal.html',
        controller: 'DetailModalCtrl',
        controllerAs: 'ctrl',
        resolve: {
          file: function () {
            return file;
          },
          users: function () {
            return ctrl.users;
          }
        }
      });
    }

    function shareScript (fileId) {
      var file = fileService.files[fileId];
      ctrl.detailModal = $uibModal.open({
        templateUrl: 'views/shareModal.html',
        controller: 'ShareModalCtrl',
        controllerAs: 'ctrl',
        resolve: {
          file: function () {
            return file;
          },
          users: function () {
            return ctrl.users;
          },
          currentUser: function () {
            return ctrl.user;
          }
        }
      });
    }

    function printDocument (fileId) {
      printService.print();
    }


    function selectNewScript (type) {
      console.log(type);
    }

    function insertTemplate (template) {
      codemirrorService.insertTextAtCursor(template);
    }


    $rootScope.$on('signedIn', function (e, user) {
      ctrl.user = user;
      // $scope.apply();
    });

    $rootScope.$on('snapEvent', function (e, d) {
      if (d === 'closed') {
        ctrl.openAccordion = {};
        ctrl.openAccordion[fileService.currentFile.id] = true;
        $scope.$apply();
      }
    });

    $rootScope.$on('usersLoaded', function (e, users) {
      ctrl.users = users;
    });

    $rootScope.$on('onCMCursorActivity', function (e, cursorToken) {
      cursorToken = cursorToken.replace('vlc-', '');
      ctrl.cursorToken = cursorToken;
      ctrl.nextElement = ctrl.scriptElements[cursorToken].next;
    });

    $rootScope.$on('onCMFocus', function (e) {
      ctrl.activeTab = 1;
      // $scope.$apply();
    });
  }]);
