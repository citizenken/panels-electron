'use strict';

/**
 * @ngdoc function
 * @name panelsElectronApp.controller:SidebarCtrl
 * @description
 * # SidebarCtrl
 * Controller of the panelsElectronApp
 */
angular.module('panels')
  .controller('SidebarCtrl', function () {
    var ctrl = this;
    ctrl.showHistory = showHistory;
    ctrl.inspectHistory = null;
    ctrl.showDetail = showDetail;
    ctrl.detail = null;

    function showHistory (file) {
      ctrl.inspectHistory  = file;
    }

    function showDetail (fileId) {
      ctrl.detail = (ctrl.detail === fileId) ? null : fileId;
    }
  });
