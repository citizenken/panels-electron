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
    client_id = '537455563422-d0l06urs86qsfshsbehllp7p8pcstkqf.apps.googleusercontent.com', // jscs:disable
    redirect_uri = 'https://localhost/callback', // jscs:disable
    requestOptions = {
      client_id: client_id, // jscs:disable
      response_type: 'token', // jscs:disable
      redirect_uri: redirect_uri, // jscs:disable
      scope: ['openid',
      'https://www.googleapis.com/auth/plus.me',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'].join(' '),
      response_type: 'code' // jshint ignore:line
    },
    authEndPoint = 'https://accounts.google.com/o/oauth2/v2/auth?';

    // Public API here
    return {
      authWindow: null,
      accessToken: null,
      googleOauth: function (promptForAccount) {
        if (!promptForAccount) {
          requestOptions.prompt = 'select_account';
        }

        var self = this;
        var deferred = $q.defer();
        var authWindow = new BrowserWindow({ width: 800, height: 600, show: false, 'node-integration': false }),
        qs = $httpParamSerializerJQLike(requestOptions),
        authUrl = authEndPoint + qs;
        authWindow.webContents.openDevTools();
        this.authWindow = authWindow;

        authWindow.loadURL(authUrl);
        authWindow.once('ready-to-show', function () {
          try {
            authWindow.show();
          } catch (err) {
            console.log('caught show error', err);
          }
        });

        authWindow.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
          if (newUrl.indexOf(requestOptions.redirect_uri) === 0) {
            deferred.resolve(self.handleGoogleCallback(newUrl));
          }
        });

        authWindow.on('close', function() {
            authWindow = null;
            self.authWindow = null;
        }, false);

        return deferred.promise;
      },

      handleGoogleCallback: function (url) {
        this.authWindow.destroy();
        var code = url.match(/.*code=([^&]+)/);
        if (code) {
          this.code = code[1];
          var params = {
            code: this.code,
            client_id: client_id,
            client_secret: 'z_IJ8cttIV1kth3NHXW-59ix',
            grant_type: 'authorization_code',
            redirect_uri: redirect_uri
          },
          config = {
            url: 'https://www.googleapis.com/oauth2/v4/token',
            method: 'POST',
            data: $httpParamSerializerJQLike(params),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          };

          return $http(config)
          .then(function (response) {
            return response.data.id_token;
          })
          .catch(function (error) {
            console.log(error);
          });
        }
      }
    };
  }]);
