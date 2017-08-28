// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import fetchMock from '../utils/fetch-mock';
import * as segments from '../../src/admin/segments';

describe('segments', () => {
    describe('with fake server', () => {
        describe('getDataProductSegments', () => {
            afterEach(() => {
                fetchMock.restore();
            });

            it('should reject with 400 when resource fails', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/dataproducts/dataProductId/segments',
                    400
                );

                return segments.getDataProductSegments('contractId', 'dataProductId').then(null, err => expect(err).toBeInstanceOf(Error));
            });

            it('should return dataproduct segments', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments',
                    {
                        status: 200,
                        body: JSON.stringify({
                            segments: {
                                items: [{
                                    segment: {
                                        id: 'segmentId',
                                        domains: [
                                            'data-admin-test1',
                                            'data-admin-test2'
                                        ],
                                        links: {
                                            self: '/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId'
                                        }
                                    }
                                }, {
                                    segment: {
                                        id: 'segmentId1',
                                        domains: [
                                            'data-admin-test1',
                                            'data-admin-test2'
                                        ],
                                        links: {
                                            self: '/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId1'
                                        }
                                    }
                                }]
                            }
                        })
                    }
                );
                return segments.getDataProductSegments('contractId', 'dataproductId').then((result) => {
                    expect(result.items.length).toBe(2);
                    expect(result.items[0].domains[0]).toBe('data-admin-test1');
                    expect(result.items[0].domains[1]).toBe('data-admin-test2');
                    expect(result.items[1].domains[0]).toBe('data-admin-test1');
                    expect(result.items[1].domains[1]).toBe('data-admin-test2');

                    expect(result.items[0].id).toBe('segmentId');
                    expect(result.items[1].id).toBe('segmentId1');
                });
            });

            it('should create dataproduct', () => {
                fetchMock.post(
                    '/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments',
                    {
                        status: 201,
                        body: JSON.stringify({
                            segmentCreate: {
                                id: 'segmentId',
                                title: 'segmentId',
                                domain: '/gdc/admin/contracts/contractId/domains/data-admin-test1'

                            }
                        })
                    }
                );
                return segments.createSegment('contractId', 'dataproductId', 'data-admin-test1').then((result) => {
                    expect(result.status).toBe(201);
                });
            });
        });
    });
});
