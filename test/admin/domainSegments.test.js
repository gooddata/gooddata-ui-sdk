// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import fetchMock from '../utils/fetch-mock';
import { createModule as domainSegmentsFactory } from '../../src/admin/domainSegments';
import { createModule as xhrFactory } from '../../src/xhr';
import { createModule as configFactory } from '../../src/config';

const config = configFactory();
const xhr = xhrFactory(config);
const domainSegments = domainSegmentsFactory(xhr);

describe('domainSegments', () => {
    describe('with fake server', () => {
        describe('getDomainSegments', () => {
            afterEach(() => {
                fetchMock.restore();
            });

            it('should reject with 400 when resource fails', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/dataproducts/dataProductId/segments/segmentId/domainsegments/',
                    400
                );

                return domainSegments.getDomainSegment('contractId', 'dataProductId', 'segmentId', '').then(null, err => expect(err).toBeInstanceOf(Error));
            });

            it('should return domain segment', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId/domainsegments/data-admin-test1',
                    {
                        status: 200,
                        body: JSON.stringify({
                            domainSegment: {
                                id: 'domainSegmentId',
                                domain: 'data-admin-test1',
                                masterProject: {
                                    project: {
                                        id: 'projectId',
                                        title: 'master',
                                        projectToken: 'projectToken',
                                        links: {
                                            publicUri: 'publicUri'
                                        },
                                        state: 'ENABLED'
                                    }
                                },
                                links: {
                                    self: '/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId/domainsegments/data-admin-test1'
                                }
                            }
                        })
                    }
                );
                return domainSegments.getDomainSegment('contractId', 'dataproductId', 'segmentId', 'data-admin-test1', '').then((result) => {
                    expect(result.domain).toBe('data-admin-test1');
                    expect(result.id).toBe('domainSegmentId');
                    expect(result.masterProject.project.id).toBe('projectId');
                    expect(result.masterProject.project.title).toBe('master');
                    expect(result.masterProject.project.projectToken).toBe('projectToken');
                    expect(result.masterProject.project.links.publicUri).toBe('publicUri');
                });
            });

            it('should return domain segments', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId/domainsegments',
                    {
                        status: 200,
                        body: JSON.stringify({
                            domainSegments: {
                                items: [{
                                    domainSegment: {
                                        id: 'segmentId',
                                        domain: 'data-admin-test1',
                                        masterProject: {
                                            project: {
                                                id: 'projectId',
                                                title: 'master',
                                                projectToken: 'projectToken',
                                                links: {
                                                    publicUri: 'publicUri'
                                                },
                                                state: 'ENABLED'
                                            }
                                        },
                                        links: {
                                            self: '/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId/domainsegments/data-admin-test1'
                                        }
                                    }
                                }, {
                                    domainSegment: {
                                        id: 'segmentId1',
                                        domain: 'data-admin-test2',
                                        masterProject: {
                                            project: {
                                                id: 'projectId1',
                                                title: 'master',
                                                projectToken: 'projectToken',
                                                links: {
                                                    publicUri: 'publicUri'
                                                },
                                                state: 'ENABLED'
                                            }
                                        },
                                        links: {
                                            self: '/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId1/domainsegments/data-admin-test2'
                                        }
                                    }
                                }]
                            }
                        })
                    }
                );
                return domainSegments.getDomainSegments('contractId', 'dataproductId', 'segmentId', '').then((result) => {
                    expect(result.items.length).toBe(2);

                    expect(result.items[0].domain).toBe('data-admin-test1');
                    expect(result.items[0].id).toBe('segmentId');
                    expect(result.items[0].masterProject.project.id).toBe('projectId');
                    expect(result.items[0].masterProject.project.title).toBe('master');
                    expect(result.items[0].masterProject.project.projectToken).toBe('projectToken');
                    expect(result.items[0].masterProject.project.links.publicUri).toBe('publicUri');

                    expect(result.items[1].domain).toBe('data-admin-test2');
                    expect(result.items[1].id).toBe('segmentId1');
                    expect(result.items[1].masterProject.project.id).toBe('projectId1');
                    expect(result.items[1].masterProject.project.title).toBe('master');
                    expect(result.items[1].masterProject.project.projectToken).toBe('projectToken');
                    expect(result.items[1].masterProject.project.links.publicUri).toBe('publicUri');
                });
            });
        });
    });
});
