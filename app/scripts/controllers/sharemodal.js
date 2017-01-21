'use strict';

/**
 * @ngdoc function
 * @name panelsElectronApp.controller:DetailmodalCtrl
 * @description
 * # DetailmodalCtrl
 * Controller of the panelsElectronApp
 */
angular.module('panels')
  .controller('ShareModalCtrl', ['$uibModalInstance', 'file', 'users', 'lodash',
    function ($uibModalInstance, file, users, lodash) {
    var ctrl = this;
    ctrl.file = file;
    ctrl.users = users;
    ctrl.access = 'View';
    ctrl.selectedUsers = [];

  ctrl.removeCollaborator = function (userId) {
    var collabIds = lodash.keys(ctrl.file.collaborators);
    if (collabIds.indexOf(userId) > -1) {
      var oldVersion = angular.copy(ctrl.file);
      delete ctrl.file.collaborators[userId];
      ctrl.file.update(oldVersion);
    }
  };

  ctrl.done = function () {
    if (ctrl.selectedUsers) {
      ctrl.file.addCollaborators(ctrl.selectedUsers, ctrl.access);
    }
    $uibModalInstance.close(ctrl.file);
  };

  ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  }]);
