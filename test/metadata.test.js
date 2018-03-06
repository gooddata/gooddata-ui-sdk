// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import { range, find } from 'lodash';
import fetchMock from './utils/fetch-mock';
import { mockPollingRequest } from './helpers/polling';
import { createModule as mdFactory } from '../src/metadata';
import { createModule as xhrFactory } from '../src/xhr';
import { createModule as configFactory } from '../src/config';
import * as fixtures from './fixtures/metadata';

const config = configFactory();
const xhr = xhrFactory(config);
const md = mdFactory(xhr);

describe('metadata', () => {
    describe('with fake server', () => {
        afterEach(() => {
            fetchMock.restore();
        });

        describe('getObjectsByQuery', () => {
            it('should reject with 400 from backend and not use default limit', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/objects/query?limit=5',
                    400
                );

                const okCallback = jest.fn();
                const errorCallback = jest.fn();

                return md.getObjectsByQuery('myFakeProjectId', { limit: 5 })
                    .then(okCallback, errorCallback)
                    .then(() => {
                        expect(okCallback).not.toHaveBeenCalled();
                        expect(errorCallback).toHaveBeenCalled();
                        expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(Error);
                    });
            });

            it('should return correct number of entries on two pages', () => {
                const body1 = JSON.stringify({
                    objects: {
                        paging: {
                            next: '/gdc/md/myFakeProjectId/objects/query?category=dataSet&limit=50&offset=50',
                            count: 50,
                            offset: 0
                        },
                        items: ['item1.1', 'item1.2']
                    }
                });
                fetchMock.mock('/gdc/md/myFakeProjectId/objects/query?category=dataSet&limit=50', { status: 200, body: body1 });

                const body2 = JSON.stringify({
                    objects: {
                        paging: {
                            count: 50,
                            offset: 50
                        },
                        items: ['item2.1', 'item2.2']
                    }
                });
                fetchMock.mock('/gdc/md/myFakeProjectId/objects/query?category=dataSet&limit=50&offset=50', { status: 200, body: body2 });

                return md.getObjectsByQuery('myFakeProjectId', { category: 'dataSet' }).then((result) => {
                    expect(result.length).toBe(4);
                });
            });
        });

        describe('getVisualizations', () => {
            it('should reject with 400 from backend', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/visualizations',
                    400
                );

                const okCallback = jest.fn();
                const errorCallback = jest.fn();

                return md.getVisualizations('myFakeProjectId')
                    .then(okCallback, errorCallback)
                    .then(() => {
                        expect(okCallback).not.toHaveBeenCalled();
                        expect(errorCallback).toHaveBeenCalled();
                        expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(Error);
                    });
            });

            it('should return correct number of entries', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/visualizations',
                    { status: 200, body: JSON.stringify({ query: { entries: [{ title: 'a1' }, { title: 'a2' }] } }) }
                );

                return md.getVisualizations('myFakeProjectId').then((result) => {
                    expect(result.length).toBe(2);
                });
            });
        });

        describe('getAttributes', () => {
            it('should reject with 400 from backend', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/attributes',
                    400
                );

                const okCallback = jest.fn();
                const errorCallback = jest.fn();

                return md.getAttributes('myFakeProjectId')
                    .then(okCallback, errorCallback)
                    .then(() => {
                        expect(okCallback).not.toHaveBeenCalled();
                        expect(errorCallback).toHaveBeenCalled();
                        expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(Error);
                    });
            });

            it('should return correct number of entries', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/attributes',
                    { status: 200, body: JSON.stringify({ query: { entries: [{ title: 'a1' }, { title: 'a2' }] } }) }
                );

                return md.getAttributes('myFakeProjectId').then((result) => {
                    expect(result.length).toBe(2);
                });
            });
        });

        describe('createObject', () => {
            it('should return created object', () => {
                const newObj = {
                    metric: {
                        content: {},
                        meta: {}
                    }
                };

                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/obj?createAndGet=true',
                    {
                        status: 200,
                        body: JSON.stringify({
                            ...newObj
                        })
                    }
                );

                return md.createObject('myFakeProjectId', newObj).then((createdObj) => {
                    expect(createdObj).toEqual(newObj);
                });
            });
        });

        describe('etlPull', () => {
            const mockTask = status => ({
                wTaskStatus: {
                    status
                }
            });

            const finishedTask = mockTask('OK');
            const runningTask = mockTask('RUNNING');
            const etlUri = '/gdc/md/1/tasks/1/status';
            const triggerEtlResponse = {
                pull2Task: {
                    links: {
                        poll: etlUri
                    }
                }
            };

            describe('/gdc/md/1/etl/pull2 call successful', () => {
                function mockIntialPost() {
                    fetchMock.post(
                        '/gdc/md/1/etl/pull2',
                        {
                            status: 201,
                            body: JSON.stringify(triggerEtlResponse)
                        }
                    );
                }

                it('should poll until task status is OK', () => {
                    mockIntialPost();

                    mockPollingRequest(etlUri, runningTask, finishedTask);

                    return md.etlPull('1', '1', { pollStep: 1 }).then((result) => {
                        expect(result).toEqual(finishedTask);
                    });
                });
            });

            describe('/gdc/md/1/etl/pull2 call not successful', () => {
                it('should reject if task ends with error', () => {
                    fetchMock.post(
                        '/gdc/md/1/etl/pull2',
                        {
                            status: 400,
                            body: JSON.stringify({})
                        }
                    );

                    return md.etlPull('1', '1').then(() => {
                        throw new Error('Should reject the promise if task ends with error');
                    }, (err) => {
                        expect(err).toBeInstanceOf(Error);
                    });
                });
            });
        });

        describe('ldmManage', () => {
            const mockTask = status => ({
                wTaskStatus: {
                    status
                }
            });

            const finishedTask = mockTask('OK');
            const runningTask = mockTask('RUNNING');
            const manageStatusUri = '/gdc/md/1/tasks/1/status';
            const triggerLdmManageResponse = {
                entries: [
                    {
                        link: manageStatusUri
                    }
                ]
            };

            describe('/gdc/md/1/ldm/manage2 call successful', () => {
                function mockIntialPost() {
                    fetchMock.post(
                        '/gdc/md/1/ldm/manage2',
                        {
                            status: 200,
                            body: JSON.stringify(triggerLdmManageResponse)
                        }
                    );
                }

                it('should poll until task status is OK', () => {
                    mockIntialPost();

                    mockPollingRequest(manageStatusUri, runningTask, finishedTask);

                    return md.ldmManage('1', '1', { pollStep: 1 }).then((result) => {
                        expect(result).toEqual(finishedTask);
                    });
                });
            });

            describe('/gdc/md/1/ldm/manage2 call not successful', () => {
                it('should reject if task ends with error', () => {
                    fetchMock.post(
                        '/gdc/md/1/ldm/manage2',
                        {
                            status: 400,
                            body: JSON.stringify({})
                        }
                    );

                    return md.ldmManage('1', '1').then(() => {
                        throw new Error('Should reject the promise if task ends with error');
                    }, (err) => {
                        expect(err).toBeInstanceOf(Error);
                    });
                });
            });
        });

        describe('getDimensions', () => {
            it('should reject with 400 from backend', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/dimensions',
                    400
                );

                const okCallback = jest.fn();
                const errorCallback = jest.fn();

                return md.getDimensions('myFakeProjectId')
                    .then(okCallback, errorCallback)
                    .then(() => {
                        expect(okCallback).not.toHaveBeenCalled();
                        expect(errorCallback).toHaveBeenCalled();
                        expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(Error);
                    });
            });

            it('should return correct number of entries', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/dimensions',
                    {
                        status: 200,
                        body: JSON.stringify({ query: { entries: [{ title: 'a1' }, { title: 'a2' }] } })
                    }
                );

                return md.getDimensions('myFakeProjectId').then((result) => {
                    expect(result.length).toBe(2);
                });
            });
        });

        describe('getFacts', () => {
            it('should reject with 400 from backend', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/facts',
                    400
                );

                const okCallback = jest.fn();
                const errorCallback = jest.fn();

                return md.getFacts('myFakeProjectId')
                    .then(okCallback, errorCallback)
                    .then(() => {
                        expect(okCallback).not.toHaveBeenCalled();
                        expect(errorCallback).toHaveBeenCalled();
                        expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(Error);
                    });
            });

            it('should return correct number of entries', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/facts',
                    {
                        status: 200,
                        body: JSON.stringify({ query: { entries: [{ title: 'a1' }, { title: 'a2' }] } })
                    }
                );

                return md.getFacts('myFakeProjectId').then((result) => {
                    expect(result.length).toBe(2);
                });
            });
        });

        describe('getMetrics', () => {
            it('should reject with 400 from backend', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/metrics',
                    400
                );

                const okCallback = jest.fn();
                const errorCallback = jest.fn();

                return md.getMetrics('myFakeProjectId')
                    .then(okCallback, errorCallback)
                    .then(() => {
                        expect(okCallback).not.toHaveBeenCalled();
                        expect(errorCallback).toHaveBeenCalled();
                        expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(Error);
                    });
            });

            it('should return correct number of entries', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/metrics',
                    {
                        status: 200,
                        body: JSON.stringify({ query: { entries: [{ title: 'a1' }, { title: 'a2' }] } })
                    }
                );

                return md.getMetrics('myFakeProjectId').then((result) => {
                    expect(result.length).toBe(2);
                });
            });
        });

        describe('getAvailableMetrics', () => {
            it('should reject with 400 from backend', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/availablemetrics',
                    400
                );

                const okCallback = jest.fn();
                const errorCallback = jest.fn();

                return md.getAvailableMetrics('myFakeProjectId')
                    .then(okCallback, errorCallback)
                    .then(() => {
                        expect(okCallback).not.toHaveBeenCalled();
                        expect(errorCallback).toHaveBeenCalled();
                        expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(Error);
                    });
            });

            it('should return correct number of entries', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/availablemetrics',
                    {
                        status: 200,
                        body: JSON.stringify({ entries: [{ link: 'm1' }, { link: 'm2' }] })
                    }
                );

                return md.getAvailableMetrics('myFakeProjectId').then((result) => {
                    expect(result.length).toBe(2);
                });
            });
        });

        describe('getAvailableAttributes', () => {
            it('should reject with 400 from backend', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/drillcrosspaths',
                    400
                );

                const okCallback = jest.fn();
                const errorCallback = jest.fn();

                return md.getAvailableAttributes('myFakeProjectId')
                    .then(okCallback, errorCallback)
                    .then(() => {
                        expect(okCallback).not.toHaveBeenCalled();
                        expect(errorCallback).toHaveBeenCalled();
                        expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(Error);
                    });
            });

            it('should return correct number of entries', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/drillcrosspaths',
                    {
                        status: 200,
                        body: JSON.stringify({ drillcrosspath: { links: [{ link: 'a1' }, { link: 'a2' }] } })
                    }
                );

                return md.getAvailableAttributes('myFakeProjectId').then((result) => {
                    expect(result.length).toBe(2);
                });
            });
        });

        describe('getAvailableFacts', () => {
            it('should reject with 400 from backend', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/availablefacts',
                    400
                );

                const okCallback = jest.fn();
                const errorCallback = jest.fn();

                return md.getAvailableFacts('myFakeProjectId')
                    .then(okCallback, errorCallback)
                    .then(() => {
                        expect(okCallback).not.toHaveBeenCalled();
                        expect(errorCallback).toHaveBeenCalled();
                        expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(Error);
                    });
            });

            it('should return correct number of entries', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/availablefacts',
                    {
                        status: 200,
                        body: JSON.stringify({ entries: [{ link: 'm1' }, { link: 'm2' }] })
                    }
                );

                return md.getAvailableFacts('myFakeProjectId').then((result) => {
                    expect(result.length).toBe(2);
                });
            });
        });

        describe('getUrisFromIdentifiers', () => {
            it('should return array with identifiers and uris', () => {
                fetchMock.post(
                    '/gdc/md/myFakeProjectId/identifiers',
                    {
                        status: 200,
                        body: JSON.stringify({
                            identifiers: [{
                                uri: '/foo/bar',
                                identifier: 'attr.foo.bar'
                            }, {
                                uri: '/fuzz/buzz',
                                identifier: 'attr.fuzz.buzz'
                            }]
                        })
                    }
                );

                return md.getUrisFromIdentifiers('myFakeProjectId', ['attr.foo.bar'])
                    .then((result) => {
                        expect(result).toEqual([{
                            uri: '/foo/bar',
                            identifier: 'attr.foo.bar'
                        }, {
                            uri: '/fuzz/buzz',
                            identifier: 'attr.fuzz.buzz'
                        }]);
                    });
            });
        });

        describe('getIdentifiersFromUris', () => {
            it('should return array with identifiers and uris', () => {
                fetchMock.post(
                    '/gdc/md/myFakeProjectId/identifiers',
                    {
                        status: 200,
                        body: JSON.stringify({
                            identifiers: [{
                                uri: '/foo/bar',
                                identifier: 'attr.foo.bar'
                            }, {
                                uri: '/fuzz/buzz',
                                identifier: 'attr.fuzz.buzz'
                            }]
                        })
                    }
                );

                return md.getIdentifiersFromUris('myFakeProjectId', ['/foo/bar'])
                    .then((result) => {
                        expect(result).toEqual([{
                            uri: '/foo/bar',
                            identifier: 'attr.foo.bar'
                        }, {
                            uri: '/fuzz/buzz',
                            identifier: 'attr.fuzz.buzz'
                        }]);
                    });
            });
        });

        describe('translateElementLabelsToUris', () => {
            it('should return two label uris', () => {
                fetchMock.post(
                    '/gdc/md/myFakeProjectId/labels',
                    {
                        status: 200,
                        body: JSON.stringify(fixtures.elementsLabelsResult)
                    });

                md.translateElementLabelsToUris('myFakeProjectId', '/gdc/md/labelUri', ['2014-01-01', '2016-01-01'])
                    .then((result) => {
                        expect(result).toEqual(fixtures.elementsLabelsResult.elementLabelUri);
                    });
            });
        });

        describe('getObjectUri', () => {
            it('should return uri when identifier exists', () => {
                fetchMock.post(
                    '/gdc/md/myFakeProjectId/identifiers',
                    {
                        status: 200,
                        body: JSON.stringify({
                            identifiers: [{
                                uri: '/foo/bar',
                                identifier: 'attr.foo.bar'
                            }]
                        })
                    }
                );

                return md.getObjectUri('myFakeProjectId', 'attr.foo.bar').then((result) => {
                    expect(result).toBe('/foo/bar');
                });
            });

            it('should reject promise when identifier does not exist', () => {
                fetchMock.post(
                    '/gdc/md/myFakeProjectId/identifiers',
                    {
                        status: 200,
                        body: JSON.stringify({ identifiers: [] })
                    }
                );

                return md.getObjectUri('myFakeProjectId', 'foo.bar').then(null, err => expect(err).toBeInstanceOf(Error));
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
                postSpy = jest.spyOn(xhr, 'post');
            });

            afterEach(() => {
                postSpy.mockRestore();
            });

            it('should load object dependencies', () => {
                fetchMock.mock(
                    using2Uri,
                    { status: 200, body: JSON.stringify({ entries: respondEntries }) }
                );

                return md.getObjectUsing(projectId, object, { types }).then((result) => {
                    expect(postSpy).toHaveBeenCalledWith(using2Uri, {
                        data: JSON.stringify({
                            inUse: {
                                uri: object,
                                types,
                                nearest: 0
                            }
                        })
                    });

                    expect(result).toEqual(respondEntries);
                });
            });

            it('should be properly called with nearest when requested', () => {
                fetchMock.mock(
                    using2Uri,
                    { status: 200, body: JSON.stringify({ entries: respondEntries }) }
                );

                const nearest = true;

                return md.getObjectUsing(projectId, object, { types, nearest }).then(() => {
                    expect(postSpy).toHaveBeenCalledWith(using2Uri, {
                        data: JSON.stringify({
                            inUse: {
                                uri: object,
                                types,
                                nearest: 1
                            }
                        })
                    });
                });
            });

            it('should return rejected promise if 400 returned from backend', () => {
                fetchMock.mock(
                    using2Uri,
                    { status: 400, body: JSON.stringify({}) }
                );

                return md.getObjectUsing(projectId, object, { types }).then(() => {
                    throw new Error('Should reject the promise on 400 response');
                }).catch((err) => {
                    expect(err.response.status).toBe(400);
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
                postSpy = jest.spyOn(xhr, 'post');
            });

            afterEach(() => {
                postSpy.mockRestore();
            });

            it('should load objects dependencies', () => {
                fetchMock.post(
                    using2Uri,
                    { status: 200, body: JSON.stringify({ useMany: response }) }
                );

                return md.getObjectUsingMany(projectId, objects, { types }).then((result) => {
                    expect(postSpy).toHaveBeenCalledWith(using2Uri, {
                        data: JSON.stringify({
                            inUseMany: {
                                uris: objects,
                                types,
                                nearest: 0
                            }
                        })
                    });
                    expect(result).toEqual(response);
                });
            });

            it('should be properly called with nearest when requested', () => {
                fetchMock.mock(
                    using2Uri,
                    { status: 200, body: JSON.stringify({ useMany: response }) }
                );

                const nearest = true;

                return md.getObjectUsingMany(projectId, objects, { types, nearest }).then(() => {
                    expect(postSpy).toHaveBeenCalledWith(using2Uri, {
                        data: JSON.stringify({
                            inUseMany: {
                                uris: objects,
                                types,
                                nearest: 1
                            }
                        })
                    });
                });
            });

            it('should return rejected promise if 400 returned from backend', () => {
                fetchMock.mock(
                    using2Uri,
                    { status: 400, body: JSON.stringify({}) }
                );

                return md.getObjectUsingMany(projectId, objects, { types }).then(() => {
                    throw new Error('Should reject the promise on 400 response');
                }).catch((err) => {
                    expect(err.response.status).toBe(400);
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
                postSpy = jest.spyOn(xhr, 'post');
            });

            afterEach(() => {
                postSpy.mockRestore();
            });

            it('should load elements', () => {
                const { uris, respondEntries } = generateUrisAndResponse(projectId, 2);

                fetchMock.mock(
                    getUri,
                    { status: 200, body: JSON.stringify({ objects: { items: respondEntries } }) }
                );

                return md.getObjects(projectId, uris).then((result) => {
                    expect(postSpy).toHaveBeenCalledTimes(1);
                    expect(postSpy).toHaveBeenCalledWith(getUri, {
                        data: JSON.stringify({
                            get: {
                                items: uris
                            }
                        })
                    });

                    expect(result).toEqual(respondEntries);
                });
            });

            it('should load elements chunked', () => {
                const { uris, respondEntries } = generateUrisAndResponse(projectId, 80);

                fetchMock.mock(`/gdc/md/${projectId}/objects/get`, (url, opts) => {
                    const requestBody = JSON.parse(opts.data);

                    // respond with only those items which were requested
                    const respondItems = requestBody.get.items.map(itemUri =>
                        find(respondEntries, responseItem => responseItem.meta.uri === itemUri));

                    return {
                        body: JSON.stringify({ objects: {
                            items: respondItems
                        } }),
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    };
                });

                return md.getObjects(projectId, uris).then((result) => {
                    expect(postSpy).toHaveBeenCalledTimes(2);
                    expect(postSpy).toHaveBeenCalledWith(getUri, {
                        data: JSON.stringify({
                            get: {
                                items: uris.slice(0, 50)
                            }
                        })
                    });
                    expect(postSpy).toHaveBeenCalledWith(getUri, {
                        data: JSON.stringify({
                            get: {
                                items: uris.slice(50, 80)
                            }
                        })
                    });

                    expect(result).toEqual(respondEntries);
                });
            });

            it('should return rejected promise if 400 returned from backend', () => {
                const { uris } = generateUrisAndResponse(projectId, 5);
                fetchMock.mock(
                    getUri,
                    { status: 400, body: JSON.stringify({}) }
                );

                return md.getObjects(projectId, uris).then(() => {
                    throw new Error('Should reject the promise on 400 response');
                }).catch((err) => {
                    expect(err.response.status).toBe(400);
                });
            });
        });

        describe('getValidElements', () => {
            let postSpy;
            const projectId = 'myFakeProjectId';
            const attributeId = 'attribute.id';
            const uri = `/gdc/md/${projectId}/obj/${attributeId}/validElements`;

            beforeEach(() => {
                postSpy = jest.spyOn(xhr, 'post');
            });

            afterEach(() => {
                postSpy.mockRestore();
            });

            it('should process params from options', () => {
                const queryString = '?limit=10&offset=5&order=asc&filter=foo&prompt=bar';
                fetchMock.mock(`${uri}${queryString}`, () => {
                    return {
                        body: JSON.stringify({
                            validElements: {
                                items: []
                            }
                        }),
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    };
                });

                const options = {
                    limit: 10,
                    offset: 5,
                    order: 'asc',
                    filter: 'foo',
                    prompt: 'bar',
                    uris: ['foo', 'bar'],
                    complement: true,
                    includeTotalCountWithoutFilters: true,
                    restrictiveDefinition: 'foo'
                };

                return md.getValidElements(projectId, attributeId, options)
                    .then((result) => {
                        expect(postSpy).toHaveBeenCalledTimes(1);
                        expect(postSpy).toHaveBeenCalledWith(`${uri}${queryString}`, {
                            data: JSON.stringify({
                                validElementsRequest: {
                                    uris: options.uris,
                                    complement: true,
                                    includeTotalCountWithoutFilters: true,
                                    restrictiveDefinition: 'foo'
                                }
                            })
                        });

                        expect(result).toEqual({
                            validElements: {
                                items: []
                            }
                        });
                    });
            });

            it('should strip ? if no params defined', () => {
                fetchMock.mock(uri, () => {
                    return {
                        body: JSON.stringify({
                            validElements: {
                                items: []
                            }
                        }),
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    };
                });

                const options = {};

                return md.getValidElements(projectId, attributeId, options)
                    .then((result) => {
                        expect(postSpy).toHaveBeenCalledTimes(1);
                        expect(postSpy).toHaveBeenCalledWith(uri, {
                            data: JSON.stringify({
                                validElementsRequest: {}
                            })
                        });

                        expect(result).toEqual({
                            validElements: {
                                items: []
                            }
                        });
                    });
            });
        });
    });
});
