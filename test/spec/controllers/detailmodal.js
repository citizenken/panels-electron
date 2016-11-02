'use strict';

describe('Controller: DetailmodalCtrl', function () {

  // load the controller's module
  beforeEach(module('panelsElectronApp'));

  var DetailmodalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DetailmodalCtrl = $controller('DetailmodalCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(DetailmodalCtrl.awesomeThings.length).toBe(3);
  });
});
