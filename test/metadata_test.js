// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
/*eslint func-names:0*/
import * as md from '../src/metadata';

describe('metadata', () => {
    let server;
    describe('with fake server', () => {
        beforeEach(function() {
            server = sinon.fakeServer.create();
            server.autoRespond = true;
        });

        afterEach(function() {
            server.restore();
        });

        describe('getAttributes', () => {
            it('should reject with 400 from backend', done => {
                server.respondWith(
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

            it('should return correct number of entries', done => {
                server.respondWith(
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

        describe('getDimensions', () => {
            it('should reject with 400 from backend', done => {
                server.respondWith(
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

            it('should return correct number of entries', done => {
                server.respondWith(
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

        describe('getFacts', () => {
            it('should reject with 400 from backend', done => {
                server.respondWith(
                    '/gdc/md/myFakeProjectId/query/facts',
                    [400, {'Content-Type': 'application/json'}, '']
                );

                md.getFacts('myFakeProjectId').then(function() {
                    expect().fail('Should reject with 400');
                    done();
                }, function(err) {
                    expect(err.status).to.be(400);
                    done();
                });
            });

            it('should return correct number of entries', done => {
                server.respondWith(
                    '/gdc/md/myFakeProjectId/query/facts',
                    [200, {'Content-Type': 'application/json'},
                    JSON.stringify({query: { entries: [{title: 'a1'}, {title: 'a2'}]}})]
                );

                md.getFacts('myFakeProjectId').then(function(result) {
                    expect(result.length).to.be(2);
                    done();
                });
            });
        });

        describe('getMetrics', () => {
            it('should reject with 400 from backend', done => {
                server.respondWith(
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

            it('should return correct number of entries', done => {
                server.respondWith(
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

        describe('getAvailableMetrics', () => {
            it('should reject with 400 from backend', done => {
                server.respondWith(
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

            it('should return correct number of entries', done => {
                server.respondWith(
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

        describe('getAvailableAttributes', () => {
            it('should reject with 400 from backend', done => {
                server.respondWith(
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

            it('should return correct number of entries', done => {
                server.respondWith(
                    '/gdc/md/myFakeProjectId/drillcrosspaths',
                    [200, {'Content-Type': 'application/json'},
                    JSON.stringify({drillcrosspath: {links: [{link: 'a1'}, {link: 'a2'}]}})]
                );

                md.getAvailableAttributes('myFakeProjectId').then(function(result) {
                    expect(result.length).to.be(2);
                    done();
                });
            });
        });

        describe('getAvailableFacts', () => {
            it('should reject with 400 from backend', done => {
                server.respondWith(
                    '/gdc/md/myFakeProjectId/availablefacts',
                    [400, {'Content-Type': 'application/json'}, '']
                );

                md.getAvailableFacts('myFakeProjectId').then(function() {
                    expect().fail('Should reject with 400');
                    done();
                }, function(err) {
                    expect(err.status).to.be(400);
                    done();
                });
            });

            it('should return correct number of entries', done => {
                server.respondWith(
                    '/gdc/md/myFakeProjectId/availablefacts',
                    [200, {'Content-Type': 'application/json'},
                    JSON.stringify({entries: [{link: 'm1'}, {link: 'm2'}]})]
                );

                md.getAvailableFacts('myFakeProjectId').then(function(result) {
                    expect(result.length).to.be(2);
                    done();
                });
            });
        });

        describe('getObjectUri', () => {
            it('should return uri when identifier exists', done => {
                server.respondWith(
                    'POST',
                    '/gdc/md/myFakeProjectId/identifiers',
                    [200, {'Content-Type': 'application/json'},
                        JSON.stringify({
                            identifiers: [{
                                uri: '/foo/bar',
                                identifier: 'attr.foo.bar'
                            }]
                        })]
                );

                server.respondWith('/foo/bar', [200, {'Content-Type': 'application/json'},
                    JSON.stringify({ attribute: { meta: { uri: '/foo/bar/attr' } } })]);

                md.getObjectUri('myFakeProjectId', 'attr.foo.bar').then(function(result) {
                    expect(result).to.be('/foo/bar/attr');
                    done();
                });
            });

            it('should reject promise when identifier does not exist', done => {
                server.respondWith(
                    'POST',
                    '/gdc/md/myFakeProjectId/identifiers',
                    [200, {'Content-Type': 'application/json'},
                        JSON.stringify({ identifiers: []})]
                );

                md.getObjectUri('myFakeProjectId', 'foo.bar').then(function() {
                    expect().fail('Should reject with 404');
                }, function(err) {
                    expect(err).to.be('identifier not found');
                    done();
                });
            });

            it('should return an attribute uri for a display form identifier', done => {
                server.respondWith(
                    'POST',
                    '/gdc/md/myFakeProjectId/identifiers',
                    [200, {'Content-Type': 'application/json'},
                        JSON.stringify({ identifiers: [{
                                uri: '/foo/bar/label',
                                identifier: 'label.foo.bar'
                        }] })]
                );

                server.respondWith('/foo/bar/label', [200, {'Content-Type': 'application/json'},
                    JSON.stringify({
                        attributeDisplayForm: {
                            content: {
                                formOf: '/foo/bar'
                            },
                            meta: {
                                identifier: 'label.foo.bar',
                                uri: '/foo/bar/label',
                                title: 'Foo Bar Label'
                            }
                        }
                    })]);

                server.respondWith('/foo/bar', [200, {'Content-Type': 'application/json'},
                    JSON.stringify({ attribute: { meta: { uri: '/foo/bar/attr' } } })]);

                md.getObjectUri('myFakeProjectId', 'label.foo.bar').then(function(result) {
                    expect(result).to.be('/foo/bar/attr');
                    done();
                });
            });
        });
    });
});

