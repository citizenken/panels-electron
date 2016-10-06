'use strict';

describe('Service: watcherService', function () {

  // load the service's module
  beforeEach(module('panelsElectronApp'));

  // instantiate service
  var watcherService;
  beforeEach(inject(function (_watcherService_) {
    watcherService = _watcherService_;
  }));

  it('should do something', function () {
    expect(!!watcherService).toBe(true);
  });

});
