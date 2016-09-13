'use strict';

/**
 * @ngdoc service
 * @name panelsElectronApp.scriptservice
 * @description
 * # scriptservice
 * Factory in the panelsElectronApp.
 */
angular.module('panels')
  .factory('scriptService', ['$rootScope', 'fileService', 'lodash',
    function ($rootScope, fileService, lodash) {
    return {
      script: null,
      createScript: function () {
        this.script = new window.Script(fileService.currentFile.type);
      },

      parseCurrentFile: function () {
        if (typeof(fileService.currentFile.content) !== 'undefined' &&
        fileService.currentFile.content !== null) {
          this.createScript();
          this.script.fromBlob(fileService.currentFile.content);
          $rootScope.$emit('renderScript');
        }
      },

      generateElementHint: function (query) {
        var filtered = lodash.filter(this.script.elements, ['isSubElement', false]),
            hints = this.contextHint(query, filtered);
            hints = lodash.uniq(hints.concat(this.simpleHint(query, filtered)));
        return hints;
      },

      simpleHint: function (query, filtered) {
        var matches = lodash.filter(filtered, function(o) {
              return (o.text.substring(0, query.length) === query && o.text !== query);
            });

        var hints = [];
        angular.forEach(matches, function (value) {
          if (!value.text[0].match(/[0-9]/)) {
            hints.unshift(value.text.substring(query.length));
          } else {
            hints.unshift(value.text.substring(query.length).replace(/[0-9]/, 1));
          }
        });
        return hints;
      },

      contextHint: function (query, filtered) {
        var hints = [],
            lastElement = filtered[filtered.length - 1];
        if (hints.length === 0 &&
          query.trim().match(/[0-9]$/)) {
          return this.suggestCharacter(query, filtered);
        }

        // suggest character w/incremented dialogue
        if (hints.length === 0 &&
          query === '' &&
          lastElement &&
          lastElement.text.match(/[0-9]/) &&
          lastElement.type === 'character') {
          return this.suggestNextCharIncrement(filtered, lastElement);
        }

        // suggets next character, no starting number, empty query
        if (hints.length === 0 &&
          query === '' &&
          lastElement &&
          lastElement.type === 'character' &&
          filtered[filtered.length - 2].type === 'character') {
          return this.suggestNextCharInConvo(filtered, 2);
        }

        // suggets next character, no starting number, starting query
        // if (hints.length === 0 &&
        //   query !== '' &&
        //   filtered &&
        //   filtered[filtered.length - 2].type === 'character' &&
        //   filtered[filtered.length - 3].type === 'character') {
        //   return this.suggestNextCharInConvo(filtered, 3);
        // }

        return hints;

      },

      suggestCharacter: function (query, filtered) {
        filtered = lodash.filter(filtered, ['type', 'character']);
        var hints = [];
        angular.forEach(filtered, function (value) {
          var hint;
          if (query[query.length - 1] === ' ') {
            hint = value.text.replace(/[0-9]+ /, '');
          } else {
            hint = ' ' + value.text.replace(/[0-9]+ /, '');
          }
          hints.unshift(hint);
        });
        return hints;
      },

      suggestNextCharIncrement: function (filtered, lastElement) {
        var characters = lodash.filter(filtered, ['type', 'character']),
              nextNumber = parseInt(lastElement.text.match(/[0-9]+/)[0]) + 1,
              lastCharacter = lastElement.text.replace(/[0-9]+ /, ''),
              hints = [];

          angular.forEach(characters, function (value) {
            var character = value.text.replace(/[0-9]+ /, ''),
                suggestion = nextNumber + ' ' + character;

            if (character !== lastCharacter &&  hints.indexOf(suggestion) === -1) {
              hints.unshift(suggestion);
            }
          });
        return hints;
      },

      suggestNextCharInConvo: function (filtered, index) {
        return [filtered[filtered.length - index].text];
      }
    };
  }]);
