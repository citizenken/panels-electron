'use strict';

/**
 * @ngdoc service
 * @name panelsElectronApp.codemirrorService
 * @description
 * # codemirrorService
 * Factory in the panelsElectronApp.
 */
angular.module('panels')
  .factory('codemirrorService', ['firebaseService', 'fileService', '$rootScope', 'lodash',
    function (firebaseService, fileService, $rootScope, lodash) {
    var codemirrorService = {
      editor: null,
      cursors: {
        primary: 0
      },
      focusEndOfText: function () {
        var self = this,
        lastLineNum = self.editor.lastLine(),
        lastLine = self.editor.getLine(lastLineNum),
        lastCol = lastLine.length;

        self.editor.focus();
        self.editor.setCursor({line: lastLineNum, ch: lastCol});
      },

      registerListeners: function () {
        var self = this;
        self.editor.on('cursorActivity', self.updateCursorLocation.bind(self));
      },

      updateCursorLocation: function () {
        var self = this;
        if (firebaseService.userRef &&
          fileService.currentFile.id === firebaseService.userRef.currentFile) {
          self.showAllUserCursors();
          firebaseService.setUserCurrentCurrorPos(self.editor.getCursor());
        }
      },

      showAllUserCursors: function () {
        var self = this;

        angular.forEach(fileService.currentFile.collaborators, function (value, key) {
          if (lodash.has(firebaseService.userObjects, key) &&
            firebaseService.userObjects[key].currentFile === fileService.currentFile.id) {
            self.editor.markText(firebaseService.userObjects[key].currentCursorPosition,
              firebaseService.userObjects[key].currentCursorPosition,
              {css: 'background-color:blue'});
            // self.cursors[key] = selections.length - 1;
            // allSelections.push({
            //   anchor: firebaseService.userObjects[key].currentCursorPosition,
            //   head: firebaseService.userObjects[key].currentCursorPosition
            // });
          }
        });

        // self.editor.setSelections(allSelections, 0);
        self.editor.focus();
      },

      // showUserCursor: function (e, userid) {
      //   var self = this;
      //   if (lodash.has(fileService.currentFile.collaborators, userid) &&
      //     firebaseService.userObjects[userid].currentFile === fileService.currentFile.id){
      //     var selections = self.editor.listSelections(),
      //     allSelections = [],
      //     newRange = {};
      //     newRange.anchor = firebaseService.userObjects[userid].currentCursorPosition;
      //     newRange.head = firebaseService.userObjects[userid].currentCursorPosition;

      //     angular.forEach(selections, function (value, key) {
      //       allSelections[key] = value;
      //     });

      //     allSelections.push(newRange);
      //     self.editor.setSelections(allSelections, 0);
      //     self.editor.focus();
      //     console.log(self.editor.getCursor());
      //   }
      // }
    };

    // $rootScope.$on('userChange', codemirrorService.showUserCursor.bind(codemirrorService));


    return codemirrorService;
  }]);
