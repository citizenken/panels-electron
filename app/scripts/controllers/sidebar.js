'use strict';

/**
 * @ngdoc function
 * @name panelsElectronApp.controller:SidebarCtrl
 * @description
 * # SidebarCtrl
 * Controller of the panelsElectronApp
 */
angular.module('panels')
  .controller('SidebarCtrl', [ '$rootScope', 'fileService', 'firebaseService', '$uibModal',
    function ($rootScope, fileService, firebaseService, $uibModal) {
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
    // ctrl.showDetailModel = showDetailModel;

    function showHistory (file) {
      ctrl.inspectHistory  = file;
    }

    // function showDetail (fileId) {
    //   ctrl.detail = (ctrl.detail === fileId) ? null : fileId;
    // }

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

    $rootScope.$on('signedIn', function (e, user) {
      ctrl.user = user;
    });

    $rootScope.$on('usersLoaded', function (e, users) {
      ctrl.users = users;
    });
  }]);
