'use strict';

/**
 * @ngdoc service
 * @name panelsElectronApp.codemirrorService
 * @description
 * # codemirrorService
 * Factory in the panelsElectronApp.
 */
angular.module('panels')
  .factory('codemirrorService', function () {
    return {
      editor: null,
      focusEndOfText: function () {
        var self = this,
        lastLineNum = self.editor.lastLine(),
        lastLine = self.editor.getLine(lastLineNum),
        lastCol = lastLine.length;

        self.editor.focus();
        self.editor.setCursor({line: lastLineNum, ch: lastCol});
      }
    };
  });
