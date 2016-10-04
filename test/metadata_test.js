// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
/*eslint func-names:0*/
import * as md from '../src/metadata';
import * as xhr from '../src/xhr';
import { range, find } from 'lodash';

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

        describe('getObjectUsing', () => {
            let postSpy;

            const projectId = 'myFakeProjectId';
            const object = `/gdc/md/${projectId}/obj/1`;
            const types = ['firstType', 'secondType'];
            const using2Uri = `/gdc/md/${projectId}/using2`;

            const respondEntries = [{
                content: {},
                meta: {}
            }];

            beforeEach(() => {
                postSpy = sinon.spy(xhr, 'post');
            });

            afterEach(() => {
                postSpy.restore();
            });

            it('should load object dependencies', done => {
                server.respondWith(
                    'POST',
                    using2Uri,
                    [200, {'Content-Type': 'application/json'},
                        JSON.stringify({ entries: respondEntries })]
                );

                md.getObjectUsing(projectId, object, { types }).then(result => {
                    expect(postSpy.calledWith(using2Uri, {
                        data: JSON.stringify({
                            inUse: {
                                uri: object,
                                types,
                                nearest: 0
                            }
                        })
                    })).to.be(true);
                    expect(result).to.eql(respondEntries);
                    done();
                });
            });

            it('should be properly called with nearest when requested', done => {
                server.respondWith(
                    'POST',
                    using2Uri,
                    [200, {'Content-Type': 'application/json'},
                        JSON.stringify({ entries: respondEntries })]
                );

                const nearest = true;

                md.getObjectUsing(projectId, object, { types, nearest }).then(() => {
                    expect(postSpy.calledWith(using2Uri, {
                        data: JSON.stringify({
                            inUse: {
                                uri: object,
                                types,
                                nearest: 1
                            }
                        })
                    })).to.be(true);
                    done();
                });
            });

            it('should return rejected promise if 400 returned from backend', done => {
                server.respondWith(
                    'POST',
                    using2Uri,
                    [400, {'Content-Type': 'application/json'},
                        JSON.stringify({})]
                );

                md.getObjectUsing(projectId, object, { types }).then(() => {
                    expect().fail('Should reject the promise on 400 response');
                    done();
                }).fail(() => {
                    done();
                });
            });
        });

        describe('getObjectUsingMany', () => {
            let postSpy;

            const projectId = 'myFakeProjectId';
            const object1 = `/gdc/md/${projectId}/obj/1`;
            const object2 = `/gdc/md/${projectId}/obj/2`;
            const objects = [object1, object2];
            const types = ['firstType', 'secondType'];
            const using2Uri = `/gdc/md/${projectId}/using2`;

            const response = [{
                entries: [{
                    link: 'foo'
                }],
                uri: object1
            }, {
                entries: [{
                    link: 'bar'
                }],
                uri: object2
            }];

            beforeEach(() => {
                postSpy = sinon.spy(xhr, 'post');
            });

            afterEach(() => {
                postSpy.restore();
            });

            it('should load objects dependencies', () => {
                server.respondWith(
                    'POST',
                    using2Uri,
                    [200, {'Content-Type': 'application/json'},
                        JSON.stringify({ useMany: response })]
                );

                return md.getObjectUsingMany(projectId, objects, { types }).then(result => {
                    expect(postSpy.calledWith(using2Uri, {
                        data: JSON.stringify({
                            inUseMany: {
                                uris: objects,
                                types,
                                nearest: 0
                            }
                        })
                    })).to.be(true);
                    expect(result).to.eql(response);
                });
            });

            it('should be properly called with nearest when requested', () => {
                server.respondWith(
                    'POST',
                    using2Uri,
                    [200, {'Content-Type': 'application/json'},
                        JSON.stringify({ useMany: response })]
                );

                const nearest = true;

                return md.getObjectUsingMany(projectId, objects, { types, nearest }).then(() => {
                    expect(postSpy.calledWith(using2Uri, {
                        data: JSON.stringify({
                            inUseMany: {
                                uris: objects,
                                types,
                                nearest: 1
                            }
                        })
                    })).to.be(true);
                });
            });

            it('should return rejected promise if 400 returned from backend', done => {
                server.respondWith(
                    'POST',
                    using2Uri,
                    [400, {'Content-Type': 'application/json'},
                        JSON.stringify({})]
                );

                md.getObjectUsingMany(projectId, objects, { types }).then(() => {
                    expect().fail('Should reject the promise on 400 response');
                    done();
                }).fail(() => {
                    done();
                });
            });
        });

        describe('getObjects', () => {
            let postSpy;

            const generateUrisAndResponse = (projectId, number) => {
                const uris = range(number).map(i => `/gdc/md/${projectId}/obj/${i}`);
                const respondEntries = uris.map(uri => ({
                    content: {},
                    meta: { uri }
                }));

                return { uris, respondEntries };
            };

            const projectId = 'myFakeProjectId';
            const getUri = `/gdc/md/${projectId}/objects/get`;

            beforeEach(() => {
                postSpy = sinon.spy(xhr, 'post');
            });

            afterEach(() => {
                postSpy.restore();
            });

            it('should load elements', done => {
                const { uris, respondEntries } = generateUrisAndResponse(projectId, 2);

                server.respondWith(
                    'POST',
                    getUri,
                    [200, {'Content-Type': 'application/json'},
                        JSON.stringify({ objects: {
                            items: respondEntries
                        }})]
                );

                md.getObjects(projectId, uris).then(result => {
                    expect(postSpy.calledOnce).to.be(true);
                    expect(postSpy.calledWith(getUri, {
                        data: JSON.stringify({
                            get: {
                                items: uris
                            }
                        })
                    })).to.be(true);

                    expect(result).to.eql(respondEntries);
                    done();
                });
            });

            it('should load elements chunked', done => {
                const { uris, respondEntries } = generateUrisAndResponse(projectId, 80);

                server.respondWith(request => {
                    const requestBody = JSON.parse(request.requestBody);

                    // respond with only those items which were requested
                    const respondItems = requestBody.get.items.map(itemUri =>
                        find(respondEntries, responseItem => responseItem.meta.uri === itemUri));

                    request.respond(200, {'Content-Type': 'application/json'},
                        JSON.stringify({ objects: {
                            items: respondItems
                        }}));
                });

                md.getObjects(projectId, uris).then(result => {
                    expect(postSpy.calledTwice).to.be(true);
                    expect(postSpy.calledWith(getUri, {
                        data: JSON.stringify({
                            get: {
                                items: uris.slice(0, 50)
                            }
                        })
                    })).to.be(true);
                    expect(postSpy.calledWith(getUri, {
                        data: JSON.stringify({
                            get: {
                                items: uris.slice(50, 80)
                            }
                        })
                    })).to.be(true);

                    expect(result).to.eql(respondEntries);
                    done();
                });
            });

            it('should return rejected promise if 400 returned from backend', done => {
                const { uris } = generateUrisAndResponse(projectId, 5);
                server.respondWith(
                    'POST',
                    getUri,
                    [400, {'Content-Type': 'application/json'},
                        JSON.stringify({})]
                );

                md.getObjects(projectId, uris).then(() => {
                    expect().fail('Should reject the promise on 400 response');
                    done();
                }).fail(() => {
                    done();
                });
            });
        });
    });
});
