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
        fs = require('fs'),
        url = encodeURI(self.getCss() + self.getHtml()),
        fullUrl = self.rootUrl + url;

        var printWindow = new BrowserWindow({ width: 800, height: 600, show: false, 'node-integration': false });

        printWindow.loadURL(fullUrl);
        printWindow.once('ready-to-show', function () {
          printWindow.webContents.print();
          // try {
          //   printWindow.webContents.printToPDF({}, function (error, data) {
          //     if (error) throw error
          //     fs.writeFile('/tmp/print.pdf', data, (error) => {
          //       if (error) throw error
          //       console.log('Write PDF successfully.')
          //     })
          //   });
          // } catch (err) {
          //   console.log('caught show error', err);
          // }
        });
      },

      getHtml: function () {
        var self = this,
        pages = self.makePages(angular.copy(angular.element('.page')[0])).join("");
        return pages;
      },

      makePages: function (page) {
        var self = this,
        titles = angular.element('.cm-vlc-title-wrapper'),
        pages = [];

        for (var i = 0; i < titles.length; i++) {
          pages.push(angular.copy(page));
        }

        angular.forEach(pages, function (p, index) {
          var lines = Array.prototype.slice.call(p.getElementsByClassName('CodeMirror-line')),
          codeEl = p.getElementsByClassName('CodeMirror-code')[0],
          titles = p.getElementsByClassName('cm-vlc-title-wrapper'),
          startTitle = titles[index],
          startIndex = Array.prototype.indexOf.call(lines, startTitle),
          finishTitle = null,
          finishIndex = null;

          if (titles.length > (index + 1)) {
            finishTitle = titles[index + 1]
            finishIndex = Array.prototype.indexOf.call(lines, finishTitle);
          }

          // console.log(startIndex, finishIndex);

          for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (i < startIndex || finishIndex && i >= finishIndex) {
              // console.log(i);
              line.parentNode.removeChild(line);
            }
          }


          pages[index] = p.outerHTML;
        });

        return pages;
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
