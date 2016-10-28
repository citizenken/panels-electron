'use strict';

/**
 * @ngdoc function
 * @name panelsElectronApp.controller:SidebarCtrl
 * @description
 * # SidebarCtrl
 * Controller of the panelsElectronApp
 */
angular.module('panels')
  .controller('SidebarCtrl', [ '$rootScope', 'fileService', 'firebaseService',
    function ($rootScope, fileService, firebaseService) {
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

    function showHistory (file) {
      ctrl.inspectHistory  = file;
    }

    function showDetail (fileId) {
      ctrl.detail = (ctrl.detail === fileId) ? null : fileId;
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
    }

    function setSync (fileId) {
      if (fileService.files[fileId].sync) {
        fileService.setSync(fileId);
      } else {
        fileService.unsetSync(fileId);
      }
      console.log(ctrl.detail);
    }

    $rootScope.$on('signedIn', function (e, user) {
      ctrl.user = user;
    });

    $rootScope.$on('usersLoaded', function (e, users) {
      ctrl.users = users;
    });
  }]);
