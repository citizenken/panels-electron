'use strict';

/**
 * @ngdoc function
 * @name panelsElectronApp.controller:DetailmodalCtrl
 * @description
 * # DetailmodalCtrl
 * Controller of the panelsElectronApp
 */
angular.module('panels')
  .controller('DetailModalCtrl', ['$uibModalInstance', 'file', 'users',
    function ($uibModalInstance, file, users) {
    var ctrl = this;
    ctrl.file = file;
    ctrl.users = users;

  ctrl.ok = function () {
    $uibModalInstance.close(ctrl.file);
  };

  ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  }]);
