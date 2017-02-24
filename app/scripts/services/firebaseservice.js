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
    '$q', 'utilityService', 'lodash', '$rootScope', 'onlineService',
    function ($window, oauthService, $firebaseAuth, $firebaseObject,
      $q, utilityService, lodash, $rootScope, onlineService) {
    var rootRef = $window.firebase.database();
    var firebaseService = {};

    if (onlineService.online) {
      firebaseService = {
        firebaseObjects: [], // Storage for destruction on logout
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

          return oauthService.googleOauth(self.hasFirebaseAuthStored())
          .then(function (token) {
            var credential = window.firebase.auth.GoogleAuthProvider.credential(token);
            return self.auth.$signInWithCredential(credential);
          })
          .then(function (firebaseUser) {
            self.firebaseUser = firebaseUser;
            return firebaseUser;
          })
          .then(this.getUserRecord.bind(this))
          .then(function (userRef) {
            $rootScope.$emit('signedIn', userRef);
            return userRef.$loaded();
          })
          .then(this.loadUserFiles.bind(this))
          .then(function () {
            return $q.resolve(self.userRef);
          })
          .catch(function (error) {
            console.log(error);
          });
        },

        getUserRecord: function (firebaseUser) {
          var self = this,
              userRef = $firebaseObject(self.users.child(firebaseUser.uid));
          self.firebaseObjects.push(userRef);
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
          var self = this,
          remoteObj = $firebaseObject(self.fileRoot.child(fileId));
          self.firebaseObjects.push(remoteObj);
          return remoteObj;
        },

        createFileRef: function (file) {
          var self = this,
          newRef = $firebaseObject(self.fileRoot.child(file.id));
          self.files[file.id] = newRef;
          self.firebaseObjects.push(newRef);
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
          var self = this,
          users =  $firebaseObject(self.users);
          self.firebaseObjects.push(users);

          users
          .$loaded()
          .then(function (data) {
            angular.forEach(data, function (value, key) {
              if (key.indexOf('$') === -1) {
                var userObj = $firebaseObject(self.users.child(key));
                userObj.$watch(self.onUserChange);
                userObj.$loaded()
                .then(function (user) {
                  self.userObjects[key] = user;
                });
                self.firebaseObjects.push(userObj);
              }
            });
            return $q.resolve();
          })
          .then(function () {
            $rootScope.$emit('usersLoaded', self.userObjects);
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
        },

        updateUserCollaborator: function (userId, add, remove, update) {
          var self = this;
          if (remove) {
            delete self.userObjects[userId].collaborator[remove];
            if (self.userObjects[userId].currentFile == remove) {
              delete self.userObjects[userId].currentFile;
            }
          }

          if (update) {
            self.userObjects[userId].collaborator[update.file] = update.access;
          }

          if (add) {
            if (!lodash.has(self.userObjects[userId], 'collaborator')) {
              self.userObjects[userId].collaborator = {};
            }
            self.userObjects[userId].collaborator[add.file] = add.access;
          }
          self.userObjects[userId].$save();
        }
      };

      firebaseService.auth.$onAuthStateChanged(function(firebaseUser) {
        if (!firebaseUser && firebaseService.firebaseObjects) {
          angular.forEach(firebaseService.firebaseObjects, function (value) {
            value.$destroy();
          });
        }
      });

    }

    return firebaseService;
  }]);
