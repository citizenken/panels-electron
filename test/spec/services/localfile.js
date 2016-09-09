'use strict';

describe('Service: localfile', function () {

  // load the service's module
  beforeEach(module('panelsElectronApp'));

  // instantiate service
  var localfile;
  beforeEach(inject(function (_localfile_) {
    localfile = _localfile_;
  }));

  it('should do something', function () {
    expect(!!localfile).toBe(true);
  });

});
