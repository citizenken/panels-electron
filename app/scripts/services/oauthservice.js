'use strict';

/**
 * @ngdoc service
 * @name panelsElectronApp.oauth
 * @description
 * # oauth
 * Factory in the panelsElectronApp.
 */
angular.module('panels')
  .factory('oauthService', ['$httpParamSerializerJQLike', '$q', '$http',
    function ($httpParamSerializerJQLike, $q, $http) {
    var BrowserWindow = require('electron').remote.BrowserWindow,
    authRoot = 'https://panels-auth.kenpetti.us/',
    redirectUri = authRoot + 'callback', // jscs:disable
    authEndPoint = authRoot,
    logOutEndpoint = authRoot + 'logout';

    // Public API here
    return {
      authWindow: null,
      accessToken: null,
      googleOauth: function (promptForAccount) {
        var self = this,
        deferred = $q.defer(),
        authWindow = new BrowserWindow({ width: 800, height: 600, show: false, 'node-integration': false }),
        prompt = (!promptForAccount) ? 'select_account' : '';
        this.authWindow = authWindow;


        authWindow.loadURL(authEndPoint + '?prompt=' + prompt);
        authWindow.once('ready-to-show', function () {
          try {
            authWindow.show();
          } catch (err) {
            console.log('caught show error', err);
          }
        });

        authWindow.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
          if (newUrl.split('?')[0].indexOf(redirectUri) === 0) {
            authWindow.destroy();
            deferred.resolve(newUrl.match(/id_token=([^&]+)/)[1]);
          }
        });

        authWindow.on('close', function() {
            authWindow = null;
            self.authWindow = null;
        }, false);

        return deferred.promise;
      },

      logOut: function (url) {
        return $http({url: logOutEndpoint, method: 'GET'})
        .then(function (response) {
          return response;
        })
        .catch(function (error) {
          console.log(error);
        });
      }
    };
  }]);
