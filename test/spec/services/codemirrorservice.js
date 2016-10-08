'use strict';

describe('Service: codemirrorService', function () {

  // load the service's module
  beforeEach(module('panelsElectronApp'));

  // instantiate service
  var codemirrorService;
  beforeEach(inject(function (_codemirrorService_) {
    codemirrorService = _codemirrorService_;
  }));

  it('should do something', function () {
    expect(!!codemirrorService).toBe(true);
  });

});
