'use strict';

describe('Service: remotefile', function () {

  // load the service's module
  beforeEach(module('panelsElectronApp'));

  // instantiate service
  var remotefile;
  beforeEach(inject(function (_remotefile_) {
    remotefile = _remotefile_;
  }));

  it('should do something', function () {
    expect(!!remotefile).toBe(true);
  });

});
