// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import fetchMock from '../utils/fetch-mock';
import { createModule as dataProductsFactory } from '../../src/admin/dataProducts';
import { createModule as xhrFactory } from '../../src/xhr';
import { createModule as configFactory } from '../../src/config';

const config = configFactory();
const xhr = xhrFactory(config);
const dataProducts = dataProductsFactory(xhr);

describe('dataProducts', () => {
    describe('with fake server', () => {
        describe('getDataProduct', () => {
            afterEach(() => {
                fetchMock.restore();
            });

            it('should reject with 400 when resource fails', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/dataproducts/dataProductId?',
                    400
                );

                return dataProducts.getDataProduct('contractId', 'dataProductId', '', '', null).then(null, err => expect(err).toBeInstanceOf(Error));
            });

            it('should return dataproduct', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/dataproducts/dataproductId?',
                    {
                        status: 200,
                        body: JSON.stringify({
                            dataProduct: {
                                id: 'dataproductId',
                                domains: [{
                                    name: 'data-admin-test1',
                                    environment: 'TEST'
                                }],
                                links: {
                                    domains: ['/gdc/admin/contracts/contractId/domains/data-admin-test1'],
                                    domainDataProducts: ['/gdc/admin/contracts/contractId/domains/data-admin-test1/dataproducts/dataproductId'],
                                    domainSegments: ['/gdc/admin/contracts/contractId/domains/data-admin-test1/dataproducts/dataproductId/segments'],
                                    segments: ['/gdc/admin/contracts/contractId/dataproducts/dataproductid/segments'],
                                    self: '/gdc/admin/contracts/contractId/dataproducts/'
                                }
                            }
                        })
                    }
                );
                return dataProducts.getDataProduct('contractId', 'dataproductId', '', '', null).then((result) => {
                    expect(result.domains[0].name).toBe('data-admin-test1');
                    expect(result.domains[0].environment).toBe('TEST');

                    expect(result.id).toBe('dataproductId');
                    expect(result.contractId).toBe('contractId');
                });
            });

            it('should return dataproducts', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/dataproducts',
                    {
                        status: 200,
                        body: JSON.stringify({
                            dataProducts: {
                                items: [{
                                    dataProduct: {
                                        id: 'dataproductId',
                                        domains: [{
                                            name: 'data-admin-test1',
                                            environment: 'TEST'
                                        }],
                                        links: {
                                            domains: ['/gdc/admin/contracts/contractId/domains/data-admin-test1'],
                                            domainDataProducts: ['/gdc/admin/contracts/contractId/domains/data-admin-test1/dataproducts/dataproductId'],
                                            domainSegments: ['/gdc/admin/contracts/contractId/domains/data-admin-test1/dataproducts/dataproductId/segments'],
                                            segments: ['/gdc/admin/contracts/contractId/dataproducts/dataproductid/segments'],
                                            self: '/gdc/admin/contracts/contractId/dataproducts/dataproductId'
                                        }
                                    }
                                }, {
                                    dataProduct: {
                                        id: 'dataproductId1',
                                        domains: [{
                                            name: 'data-admin-test2',
                                            environment: 'TEST'
                                        }],
                                        links: {
                                            domains: ['/gdc/admin/contracts/contractId/domains/data-admin-test2'],
                                            domainDataProducts: ['/gdc/admin/contracts/contractId/domains/data-admin-test1/dataproducts/dataproductId1'],
                                            domainSegments: ['/gdc/admin/contracts/contractId/domains/data-admin-test2/dataproducts/dataproductId1/segments'],
                                            segments: ['/gdc/admin/contracts/contractId/dataproducts/dataproductId1/segments'],
                                            self: '/gdc/admin/contracts/contractId/dataproducts/dataproductId1'
                                        }
                                    }
                                }]
                            }
                        })
                    }
                );
                return dataProducts.getDataProducts('contractId', '').then((result) => {
                    expect(result.items.length).toBe(2);
                    expect(result.items[0].domains[0].name).toBe('data-admin-test1');
                    expect(result.items[0].domains[0].environment).toBe('TEST');
                    expect(result.items[1].domains[0].name).toBe('data-admin-test2');
                    expect(result.items[1].domains[0].environment).toBe('TEST');

                    expect(result.items[0].id).toBe('dataproductId');
                    expect(result.items[1].id).toBe('dataproductId1');

                    expect(result.items[0].contractId).toBe('contractId');
                    expect(result.items[1].contractId).toBe('contractId');
                });
            });

            it('should create dataproduct', () => {
                fetchMock.post(
                    '/gdc/admin/contracts/contractId/dataproducts',
                    {
                        status: 201,
                        body: JSON.stringify({
                            dataProductCreate: {
                                id: 'dataproductId',
                                domains: [
                                    'data-admin-test1',
                                    'data-admin-test2'
                                ]
                            }
                        })
                    }
                );
                return dataProducts.createDataProduct('contractId', 'dataproductId', ['data-admin-test1', 'data-admin-test2']).then((result) => {
                    expect(result.status).toBe(201);
                });
            });
        });
    });
});
