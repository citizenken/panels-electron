'use strict';

/**
 * @ngdoc function
 * @name panelsElectronApp.controller:DetailmodalCtrl
 * @description
 * # DetailmodalCtrl
 * Controller of the panelsElectronApp
 */
angular.module('panels')
  .controller('ShareModalCtrl', ['$uibModalInstance', 'file', 'users', 'currentUser', 'lodash',
    function ($uibModalInstance, file, users, currentUser, lodash) {
    var ctrl = this;
    ctrl.file = file;
    ctrl.users = users;
    ctrl.currentUser = currentUser;
    ctrl.access = 'View';
    ctrl.addUsers = [];
    ctrl.removeUsers = [];
    ctrl.updateUsers = {};
    ctrl.accessTypes = [
      'Edit',
      'Comment',
      'View'
    ]
    ctrl.collabChanges = false;

  ctrl.removeCollaborator = function (userId) {
    ctrl.removeUsers.push(userId);
    ctrl.collabChanges = true;
  };

  ctrl.changeAccess = function (userId, type) {
    ctrl.updateUsers[userId] = type;
    ctrl.collabChanges = true;
  };

  ctrl.done = function () {
    if (!angular.equals('{}', ctrl.addUsers)) {
      ctrl.collabChanges = true;
    }
    ctrl.file.modifyCollaborators({users: ctrl.addUsers, access:ctrl.access}, ctrl.removeUsers, ctrl.updateUsers);
    ctrl.addUsers = [];
    ctrl.removeUsers = [];
    ctrl.updateUsers = {};
    ctrl.collabChanges = false
    $uibModalInstance.close(ctrl.file);
  };

  ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  }]);
