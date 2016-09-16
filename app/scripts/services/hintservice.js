'use strict';

/**
 * @ngdoc service
 * @name panelsElectronApp.scriptService
 * @description
 * # scriptService
 * Factory in the panelsElectronApp.
 */
angular.module('panels')
  .factory('hintService', ['$rootScope', 'fileService', 'lodash', 'scriptService',
    function ($rootScope, fileService, lodash, scriptService) {
    return {
      generateElementHint: function (query) {
        var filtered = lodash.filter(scriptService.script.elements, ['isSubElement', false]),
            characterHints = this.characterHints(query, filtered),
            templateHints = this.templateHints(query, filtered),
            simpleHints = this.simpleHint(query, filtered),
            hints = lodash.uniq(characterHints.concat(simpleHints, templateHints));
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

      templateHints: function () {
        var hints = [];

        angular.forEach(lodash.filter(scriptService.script.config.elements, 'template'), function (value) {
          hints.push(value.template);
        });
        return hints;
      },

      characterHints: function (query, filtered) {
        var hints = [],
            lastElement = filtered[filtered.length - 1];
        if (query.trim().match(/[0-9]$/)) {
          return this.suggestCharacter(query, filtered);
        }

        // suggest character w/incremented dialogue
        if (query === '' &&
          lastElement &&
          lastElement.text.match(/[0-9]/) &&
          lastElement.type === 'character') {
          return this.suggestNextCharIncrement(filtered, lastElement);
        }

        // suggets next character, no starting number, empty query
        if (query === '' &&
          lastElement &&
          lastElement.type === 'character' &&
          filtered[filtered.length - 2] &&
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
              hints = [];

          angular.forEach(characters, function (value) {
            var character = value.text.replace(/[0-9]+ /, ''),
                suggestion = nextNumber + ' ' + character;

            if (hints.indexOf(suggestion) === -1) {
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
