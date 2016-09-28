'use strict';

/**
 * @ngdoc function
 * @name panelsElectronApp.controller:SidebarCtrl
 * @description
 * # SidebarCtrl
 * Controller of the panelsElectronApp
 */
angular.module('panels')
  .controller('SidebarCtrl', [ 'fileService', function (fileService) {
    var ctrl = this;
    ctrl.showHistory = showHistory;
    ctrl.inspectHistory = null;
    ctrl.showDetail = showDetail;
    ctrl.detail = null;
    ctrl.setSync = setSync;

    function showHistory (file) {
      ctrl.inspectHistory  = file;
    }

    function showDetail (fileId) {
      ctrl.detail = (ctrl.detail === fileId) ? null : fileId;
    }

    function setSync (fileId) {
      if (!fileService.files[fileId].sync) {
        fileService.setSync(fileId);
      } else {
        fileService.unsetSync(fileId);
      }
    }
  }]);
