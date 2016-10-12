'use strict';

/**
 * @ngdoc service
 * @name panelsElectronApp.codemirrorService
 * @description
 * # codemirrorService
 * Factory in the panelsElectronApp.
 */
angular.module('panels')
  .factory('codemirrorService', ['firebaseService', 'fileService', '$rootScope', 'lodash', 'utilityService',
    function (firebaseService, fileService, $rootScope, lodash, utilityService) {
    var codemirrorService = {
      editor: null,
      cursors: {},
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
        self.editor.on('change', function () {
          if (self.editor.getAllMarks().length !== lodash.toArray(self.cursors).length) {
            self.showAllUserCursors();
          }

          if (self.editor.getAllMarks().length > 0) {
            angular.forEach(self.cursors, function (value, key) {
              if (value.remotePosition && 
                  value.cursor !== null &&
                  !angular.equals(value.remotePosition, value.cursor.find())) {
                var newPosition = value.cursor.find();
                value.remotePosition = newPosition;
                self.updateCollabCursorLocation(newPosition, key);
              }
            });
          }
        });
      },

      updateCollabCursorLocation: function (markPos, userId) {
        var self = this;
        firebaseService.setUserCurrentCurrorPos(markPos, userId);
      },

      updateCursorLocation: function () {
        var self = this;
        if (firebaseService.userRef &&
          fileService.currentFile.id === firebaseService.userRef.currentFile) {
          firebaseService.setUserCurrentCurrorPos(self.editor.getCursor());
        }
      },

      showAllUserCursors: function () {
        var self = this;

        if (fileService.currentFile) {
          angular.forEach(fileService.currentFile.collaborators, function (value, key) {
            self.updateCollabCursor(key);
          });
        }
      },

      updateCollabCursor: function (userId) {
        var self = this;
        if (lodash.has(firebaseService.userObjects, userId) &&
              firebaseService.userRef.id !== userId &&
              firebaseService.userObjects[userId].currentFile === fileService.currentFile.id) {
              self.editor.off('update');
              var cursorColor = utilityService.getRandomColor();
              if (lodash.has(self.cursors, userId)) {
                cursorColor = self.cursors[userId].color;
                if (lodash.isObject(self.cursors[userId].cursor)){
                  self.cursors[userId].cursor.clear();
                }
              }

              var cursorContainer = document.createElement('div');
              var cursor = document.createElement('div');

              cursorContainer.className = 'collab-cursor';
              cursor.className = 'cursor';
              cursor.style = 'border-color:' + cursorColor;
              cursorContainer.appendChild(cursor);

              self.cursors[userId] = {
                color: cursorColor,
                remotePosition: firebaseService.userObjects[userId].currentCursorPosition,
                cursor: null
              };
              var bookmark = self.editor.setBookmark(firebaseService.userObjects[userId].currentCursorPosition,
                {widget: cursorContainer});
              self.cursors[userId].cursor = bookmark;
        }
      }
    };

    $rootScope.$on('userChange', function (e, user) {
      if (fileService.currentFile && 
        lodash.keys(fileService.currentFile.collaborators).indexOf(user) > -1) {
        if (lodash.has(codemirrorService.cursors, user) && 
          codemirrorService.cursors[user].cursor !== null && 
          !angular.equals(codemirrorService.cursors[user].cursor.find(), 
            firebaseService.userObjects[user].currentCursorPosition)){
          console.log('userchange');
          codemirrorService.updateCollabCursor(user);
        }
      }
    });


    return codemirrorService;
  }]);
