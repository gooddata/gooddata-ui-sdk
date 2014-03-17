// Copyright (C) 2007-2013, GoodData(R) Corporation. All rights reserved.
define(['gooddata', 'jquery'], function(sdk, $) {
    describe('sdk', function() {
        describe("async methods:", function() {
            beforeEach(function() {
                this.server = sinon.fakeServer.create();
                this.server.autoRespond = true;
            });

            afterEach(function() {
                this.server.restore();
                delete this.server;
            });
      });
    });
});
