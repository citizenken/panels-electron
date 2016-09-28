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
    function ($window, oauthService, $firebaseAuth, $firebaseObject) {
    var rootRef = $window.firebase.database();

    var firebaseService = {
      auth: $firebaseAuth(),
      users: rootRef.ref('users'),
      fileRoot: rootRef.ref('files'),
      firebaseUser: null,
      userRef: null,
      files: {},
      signIn: function (provider) {
        var self = this;
        if (!provider) {
          provider = 'google';
        }

        oauthService.googleOauth()
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
          self.getRemoteFile(key)
          .then(function (file) {
            files[key] = file;
            // remoteFiles[key] = remoteFileService.create(file);
          });
        });
        self.files = files;

        return files;
      },

      getRemoteFile: function (fileId) {
        var self = this,
            fileRef = $firebaseObject(self.fileRoot.child(fileId));
        return fileRef.$loaded();
      }
    };


    return firebaseService;
  }]);
