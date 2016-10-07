'use strict';

describe('Service: onlineService', function () {

  // load the service's module
  beforeEach(module('panelsElectronApp'));

  // instantiate service
  var onlineService;
  beforeEach(inject(function (_onlineService_) {
    onlineService = _onlineService_;
  }));

  it('should do something', function () {
    expect(!!onlineService).toBe(true);
  });

});
