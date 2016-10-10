'use strict';

/**
 * @ngdoc service
 * @name panels.fileService
 * @description
 * # fileService
 * Factory in the panels.
 */
angular.module('panels')
  .factory('File', ['utilityService',
    function (utilityService) {
    // Public API here
    return function File (scriptType) {
      this.id = utilityService.generateRandomId(20);
      this.title = null;
      this.createdOn = Date.now();
      this.modifiedOn = Date.now();
      this.author = null;
      this.content = null;
      this.sync = false;
      this.type = scriptType;
      this.history = [];
      this.collaborators = [];
      this.related = [];
      this.cursor = null;

      this.update = function (oldVersion, sync) {
        this.addHistory(oldVersion);
        this.modifiedOn = Date.now();
        this.save(sync);
      };

      this.addHistory = function (oldVersion) {
        if (oldVersion) {
          if (this.history.length === 20) {
            this.history.pop();
          }
          delete oldVersion.history;
          angular.forEach(angular.copy(oldVersion), function (value, key) {
            if (typeof value === 'function') {
              delete oldVersion[key];
            }
          });
          this.history.unshift(oldVersion);
        }
      };
    };
  }]);
