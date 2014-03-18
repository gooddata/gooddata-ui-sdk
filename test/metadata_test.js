// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
define(['metadata', 'jquery'], function(md, $) {
    describe('metadata', function() {
        describe('with fake server', function() {
            beforeEach(function() {
                this.server = sinon.fakeServer.create();
                this.server.autoRespond = true;
            });

            afterEach(function() {
                this.server.restore();
                delete this.server;
            });

            describe('getAttributes', function() {
                it('should reject with 400 from backend', function(done) {
                    this.server.respondWith(
                        '/gdc/md/myFakeProjectId/query/attributes',
                        [400, {'Content-Type': 'application/json'}, '']
                    );

                    md.getAttributes('myFakeProjectId').then(function() {
                        expect().fail('Should reject with 400');
                        done();
                    }, function(err) {
                        expect(err.status).to.be(400);
                        done();
                    });
                });

                it('should return correct number of entries', function(done) {
                    this.server.respondWith(
                        '/gdc/md/myFakeProjectId/query/attributes',
                        [200, {'Content-Type': 'application/json'},
                        JSON.stringify({query: { entries: [{title: 'a1'}, {title: 'a2'}]}})]
                    );

                    md.getAttributes('myFakeProjectId').then(function(result) {
                        expect(result.length).to.be(2);
                        done();
                    });
                });
            });

            describe('getDimensions', function() {
                it('should reject with 400 from backend', function(done) {
                    this.server.respondWith(
                        '/gdc/md/myFakeProjectId/query/dimensions',
                        [400, {'Content-Type': 'application/json'}, '']
                    );

                    md.getDimensions('myFakeProjectId').then(function() {
                        expect().fail('Should reject with 400');
                        done();
                    }, function(err) {
                        expect(err.status).to.be(400);
                        done();
                    });
                });

                it('should return correct number of entries', function(done) {
                    this.server.respondWith(
                        '/gdc/md/myFakeProjectId/query/dimensions',
                        [200, {'Content-Type': 'application/json'},
                        JSON.stringify({query: { entries: [{title: 'a1'}, {title: 'a2'}]}})]
                    );

                    md.getDimensions('myFakeProjectId').then(function(result) {
                        expect(result.length).to.be(2);
                        done();
                    });
                });
            });

            describe('getMetrics', function() {
                it('should reject with 400 from backend', function(done) {
                    this.server.respondWith(
                        '/gdc/md/myFakeProjectId/query/metrics',
                        [400, {'Content-Type': 'application/json'}, '']
                    );

                    md.getMetrics('myFakeProjectId').then(function() {
                        expect().fail('Should reject with 400');
                        done();
                    }, function(err) {
                        expect(err.status).to.be(400);
                        done();
                    });
                });

                it('should return correct number of entries', function(done) {
                    this.server.respondWith(
                        '/gdc/md/myFakeProjectId/query/metrics',
                        [200, {'Content-Type': 'application/json'},
                        JSON.stringify({query: { entries: [{title: 'a1'}, {title: 'a2'}]}})]
                    );

                    md.getMetrics('myFakeProjectId').then(function(result) {
                        expect(result.length).to.be(2);
                        done();
                    });
                });
            });

            describe('getAvailableMetrics', function() {
                it('should reject with 400 from backend', function(done) {
                    this.server.respondWith(
                        '/gdc/md/myFakeProjectId/availablemetrics',
                        [400, {'Content-Type': 'application/json'}, '']
                    );

                    md.getAvailableMetrics('myFakeProjectId').then(function() {
                        expect().fail('Should reject with 400');
                        done();
                    }, function(err) {
                        expect(err.status).to.be(400);
                        done();
                    });
                });

                it('should return correct number of entries', function(done) {
                    this.server.respondWith(
                        '/gdc/md/myFakeProjectId/availablemetrics',
                        [200, {'Content-Type': 'application/json'},
                        JSON.stringify({entries: [{link: 'm1'}, {link: 'm2'}]})]
                    );

                    md.getAvailableMetrics('myFakeProjectId').then(function(result) {
                        expect(result.length).to.be(2);
                        done();
                    });
                });
            });

            describe('getAvailableAttributes', function() {
                it('should reject with 400 from backend', function(done) {
                    this.server.respondWith(
                        '/gdc/md/myFakeProjectId/drillcrosspaths',
                        [400, {'Content-Type': 'application/json'}, '']
                    );

                    md.getAvailableAttributes('myFakeProjectId').then(function() {
                        expect().fail('Should reject with 400');
                        done();
                    }, function(err) {
                        expect(err.status).to.be(400);
                        done();
                    });
                });

                it('should return correct number of entries', function(done) {
                    this.server.respondWith(
                        '/gdc/md/myFakeProjectId/drillcrosspaths',
                        [200, {'Content-Type': 'application/json'},
                        JSON.stringify({drillcrosspath:{links: [{link: 'a1'}, {link: 'a2'}]}})]
                    );

                    md.getAvailableAttributes('myFakeProjectId').then(function(result) {
                        expect(result.length).to.be(2);
                        done();
                    });
                });
            });

        });
    });
});

