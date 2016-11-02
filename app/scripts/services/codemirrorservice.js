'use strict';

/**
 * @ngdoc service
 * @name panelsElectronApp.codemirrorService
 * @description
 * # codemirrorService
 * Factory in the panelsElectronApp.
 */

var tinycolor = require('tinycolor2');

angular.module('panels')
  .factory('codemirrorService', ['firebaseService', 'fileService', '$rootScope', 'lodash', 'utilityService', 'sidebarService',
    function (firebaseService, fileService, $rootScope, lodash, utilityService, sidebarService) {
    var codemirrorService = {
      editor: null,
      cursors: {},
      skipCursorUpdate: false,

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
        self.editor.on('blur', self.handleBlur.bind(self));
        self.editor.on('focus', self.handleFocus.bind(self));
        self.editor.on('change', self.handleChange.bind(self));
      },

      handleBlur: function () {
        var self = this;
        self.skipCursorUpdate = true;
      },

      handleFocus: function () {
        var self = this;

        $rootScope.$emit('onFocus');
        self.skipCursorUpdate = false;
        if (!angular.equals({}, firebaseService) &&
          firebaseService.userRef &&
          firebaseService.userRef.currentFile === fileService.currentFile.id &&
          lodash.has(firebaseService.userRef, 'currentCursorPosition')) {
            self.editor.setCursor(firebaseService.userRef.currentCursorPosition);
        }
      },

      handleChange: function () {
        var self = this;
        // When the doc changes, if there are cursors but no marks on the doc, set the marks
        if (self.editor.getAllMarks().length !== lodash.toArray(self.cursors).length ||
          self.editor.getAllMarks().length === 0) {
          self.showAllUserCursors();
        }

        // If there are any marks, check if the mark is different from what the remote position is. If it is,
        // update the remote
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
      },

      updateCollabCursorLocation: function (markPos, userId) {
        firebaseService.setUserCurrentCurrorPos(markPos, userId);
      },

      updateCursorLocation: function () {
        var self = this;
        if (firebaseService.userRef &&
          fileService.currentFile.id === firebaseService.userRef.currentFile &&
          !self.skipCursorUpdate) {
          firebaseService.setUserCurrentCurrorPos(self.editor.getCursor());
        }
      },

      showAllUserCursors: function () {
        var self = this;

        if (fileService.currentFile && !angular.equals({}, firebaseService.userObjects)) {
          angular.forEach(fileService.currentFile.collaborators, function (value, key) {
            self.updateCollabCursor(key);
          });

          // Want to make sure to add the mark for the author too
          if (fileService.currentFile.author !== firebaseService.userRef.id) {
            self.updateCollabCursor(fileService.currentFile.author);
          }
        }
      },

      updateCollabCursor: function (userId) {
        var self = this;
        // If the user is in the DB, and it is not the current user (since showing the current user's cursor is redudant)
        // and the user is currently looking at the same file, add a mark for that user
        if (lodash.has(firebaseService.userObjects, userId) &&
              firebaseService.userRef.id !== userId &&
              firebaseService.userObjects[userId].currentFile === fileService.currentFile.id) {
              var cursorColor = utilityService.getRandomColor();
              if (lodash.has(self.cursors, userId)) {
                cursorColor = self.cursors[userId].color;
                if (lodash.isObject(self.cursors[userId].cursor)){
                  self.cursors[userId].cursor.clear(); // Triggers a change event
                }
              }

              var cursorContainer = angular.element('<div></div>')
              .addClass('collab-cursor');

              var cursor = angular.element('<div></div>')
              .addClass('cursor')
              .css('border-color', cursorColor);

              var cursorImage = null;
              if (lodash.has(firebaseService.userObjects[userId], 'photoURL')) {
                cursorImage = angular.element('<img></img>')
                .attr('src', firebaseService.userObjects[userId].photoURL);
              } else {
                var initials = firebaseService.userObjects[userId].displayName
                .match(/(^[a-zA-Z]{1}| [a-zA-Z]{1})/g)
                .join('')
                .replace(' ', '');

                cursorImage = angular.element('<div></div>')
                .text(initials.toUpperCase());
              }

              cursorImage.addClass('cursor-name')
              .css('background-color', cursorColor);

              if (tinycolor(cursorColor).isLight()) {
                cursorImage.css('color', 'black');
              }

              cursorContainer.append(cursor);

              self.cursors[userId] = {
                color: cursorColor,
                remotePosition: firebaseService.userObjects[userId].currentCursorPosition,
                cursor: null
              };

              var bookmark = self.editor.setBookmark(firebaseService.userObjects[userId].currentCursorPosition,
                {widget: cursorContainer.get(0)}); // Triggers a change event
              self.cursors[userId].cursor = bookmark;

              var cursorCssPos = self.editor.cursorCoords(firebaseService.userObjects[userId].currentCursorPosition, 'window');


              var left = cursorCssPos.left - 25;
              // Adjust position if sidebar is open or not
              if (sidebarService.sidebarStatus === 'left') {
                left -= 265;
              }

              cursorImage
              .css('top', cursorCssPos.top - 50)
              .css('left', left);
              cursorContainer.append(cursorImage);
        }
      }
    };

    $rootScope.$on('userChange', function (e, user) {
      // Jenky check here. Essentially, we only want to update the collabCursor if the user already has a cursor
      // and if that cursor doesn't match what is refected in the DB
      if (fileService.currentFile) {
        if (lodash.has(codemirrorService.cursors, user) &&
          codemirrorService.cursors[user].cursor !== null &&
          !angular.equals(codemirrorService.cursors[user].cursor.find(),
            firebaseService.userObjects[user].currentCursorPosition)){
          codemirrorService.updateCollabCursor(user);
        }
      }
    });

    $rootScope.$on('snapEvent', function () {
      // Recalculate the cursors when the sidebar closes
      if (!angular.equals({}, codemirrorService.cursors)) {
        codemirrorService.showAllUserCursors();
      }
    });

    $rootScope.$on('usersLoaded', codemirrorService.handleChange.bind(codemirrorService));

    return codemirrorService;
  }]);
