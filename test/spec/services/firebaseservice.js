'use strict';

describe('Service: firebaseservice', function () {

  // load the service's module
  beforeEach(module('panelsElectronApp'));

  // instantiate service
  var firebaseservice;
  beforeEach(inject(function (_firebaseservice_) {
    firebaseservice = _firebaseservice_;
  }));

  it('should do something', function () {
    expect(!!firebaseservice).toBe(true);
  });

});
