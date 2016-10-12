'use strict';

/**
 * @ngdoc service
 * @name panelsElectronApp.firebaseservice
 * @description
 * # firebaseservice
 * Factory in the panelsElectronApp.
 */
angular.module('panels')
  .factory('firebaseService', ['$window', 'oauthService', '$firebaseAuth', '$firebaseObject',
    '$q', 'utilityService', 'lodash', '$rootScope',
    function ($window, oauthService, $firebaseAuth, $firebaseObject,
      $q, utilityService, lodash, $rootScope) {
    var rootRef = $window.firebase.database();

    var firebaseService = {
      auth: $firebaseAuth(),
      users: rootRef.ref('users'),
      fileRoot: rootRef.ref('files'),
      firebaseUser: null,
      userRef: null,
      files: {},
      userObjects: {},
      collabFiles: {},

      hasFirebaseAuthStored: function () {
        var keys = utilityService.getLocalStorageKeys(),
        firebaseStored = false;

        angular.forEach(keys, function (value) {
          if (value.match(/firebase:authUser.*/)) {
            firebaseStored = true;
          }
        });
        return firebaseStored;
      },

      signIn: function (provider) {
        var self = this;
        if (!provider) {
          provider = 'google';
        }

        return oauthService.googleOauth()
        .then(function (token) {
          var credential = window.firebase.auth.GoogleAuthProvider.credential(token);
          return self.auth.$signInWithCredential(credential);
        })
        .then(function (firebaseUser) {
          self.firebaseUser = firebaseUser;
          return firebaseUser;
        })
        .then(this.getUserRecord.bind(this))
        .then(this.loadUserFiles.bind(this))
        // .then(this.synchUserFiles.bind(this))
        .catch(function (error) {
          console.log(error);
        });
      },

      getUserRecord: function (firebaseUser) {
        var self = this,
            userRef = $firebaseObject(self.users.child(firebaseUser.uid));
        self.userRef = userRef;
        return userRef.$loaded();
      },

      loadUserFiles: function (userRef) {
        var self = this;
        if (!userRef.files) {
          userRef.files = {};
        }
        var files = {};
          // remoteFiles = {};
        angular.forEach(userRef.files, function (value, key) {
          files[key] = self.getRemoteFile(key);
        });
        self.files = files;

        if (lodash.has(userRef, 'collaborator')) {
          angular.forEach(userRef.collaborator, function (value, key) {
            files[key] = self.getRemoteFile(key);
          });
        }

        return files;
      },

      getRemoteFile: function (fileId) {
        var self = this;
        return $firebaseObject(self.fileRoot.child(fileId));
      },

      createFileRef: function (file) {
        var self = this,
        newRef = $firebaseObject(self.fileRoot.child(file.id));
        self.files[file.id] = newRef;
        return newRef.$loaded(function (data) {
          if (data.$value === null) {
            angular.forEach(file, function (value, key) {
              if (typeof value !== 'function') {
                data[key] = value;
              }
            });
            data.author = self.userRef.id;
            return data.$save();
          } else {
            return $q.reject();
          }
        })
        .then(function (data) {
          return $firebaseObject(data).$loaded();
        })
        .then(function (data) {
          self.userRef.files[data.id] = true;
          return self.userRef.$save();
        })
        .then(function (data) {
          return $firebaseObject(data).$loaded();
        });
      },

      loadUsers: function () {
        var self = this;

        return $firebaseObject(self.users)
        .$loaded(function (data) {
          angular.forEach(data, function (value, key) {
            if (key.indexOf('$') === -1) {
              var userObj = $firebaseObject(self.users.child(key));
              userObj.$watch(self.onUserChange);
              self.userObjects[key] = userObj;
            }
          });
          return $q.resolve();
        });
      },

      onUserChange: function (event) {
        $rootScope.$emit('userChange', event.key);
      },

      setUserCurrentFile: function (fileId) {
        var self = this;
        if (lodash.has(self.files, fileId) && firebaseService.userRef) {
          self.userRef.currentFile = fileId;
          return self.userRef.$save();
        }
      },

      setUserCurrentCurrorPos: function (cursor, userId) {
        var self = this;
        if (!userId) {
          self.userRef.currentCursorPosition = cursor;
          self.userRef.$save();
        } else {
          self.userObjects[userId].currentCursorPosition = cursor;
          self.userObjects[userId].$save();
        }
      }
    };

    return firebaseService;
  }]);
