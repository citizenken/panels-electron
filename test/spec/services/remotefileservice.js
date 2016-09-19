'use strict';

describe('Service: remotefileservice', function () {

  // load the service's module
  beforeEach(module('panelsElectronApp'));

  // instantiate service
  var remotefileservice;
  beforeEach(inject(function (_remotefileservice_) {
    remotefileservice = _remotefileservice_;
  }));

  it('should do something', function () {
    expect(!!remotefileservice).toBe(true);
  });

});
