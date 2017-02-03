'use strict';

/**
 * @ngdoc service
 * @name panels.fileService
 * @description
 * # fileService
 * Factory in the panels.
 */
angular.module('panels')
  .factory('printService', [function () {

    var printService = {
      rootUrl: 'data:text/html;charset=utf-8,',
      cssPath: {},
      pageSelector: '.page',
      lastSave: null,
      typeDelayTimer: null,
      saved: false,

      print: function () {
        var self = this,
        BrowserWindow = require('electron').remote.BrowserWindow,
        url = encodeURI(self.getCss() + self.getHtml()),
        fullUrl = self.rootUrl + url;

        var printWindow = new BrowserWindow({ width: 800, height: 600, show: false, 'node-integration': false });

        printWindow.loadURL(fullUrl);
        printWindow.once('ready-to-show', function () {
          try {
            printWindow.webContents.print();
          } catch (err) {
            console.log('caught show error', err);
          }
        });
        

      },
      
      getHtml: function () {
        return angular.element('.page')[0].outerHTML;
      },

      getCss: function () {
        var styleSheets = document.styleSheets,
        rules = [];
        angular.forEach(styleSheets, function (style) {
          if (style.href && 
            (style.href.indexOf('styles/') > -1 || style.href.indexOf('codemirror.css') > -1)) {
            var styleTag = '<style>';
            angular.forEach(style.rules, function (rule) {
              styleTag += rule.cssText;
            });
            styleTag += '</style>';
            rules.unshift(styleTag);
            
          }
        });
        return rules.join('');
      }
    };


    return printService;
  }]);
