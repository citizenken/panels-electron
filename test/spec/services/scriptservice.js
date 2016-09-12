'use strict';

describe('Service: scriptservice', function () {

  // load the service's module
  beforeEach(module('panelsElectronApp'));

  // instantiate service
  var scriptservice;
  beforeEach(inject(function (_scriptservice_) {
    scriptservice = _scriptservice_;
  }));

  it('should do something', function () {
    expect(!!scriptservice).toBe(true);
  });

});
