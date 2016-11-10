// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import fetchMock from '../utils/fetch-mock';
import * as dataProducts from '../../src/admin/dataProducts';

describe('dataProducts', () => {
    describe('with fake server', () => {
        describe('getDataProduct', () => {
            afterEach(() => {
                fetchMock.restore();
            });

            it('should reject with 400 when resource fails', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/dataproducts/dataproductId?',
                    400
                );

                return dataProducts.getDataProduct('contractId', 'dataProductId', '', '', null).then(null, err => expect(err).to.be.an(Error));
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
                    expect(result.domains[0].name).to.be('data-admin-test1');
                    expect(result.domains[0].environment).to.be('TEST');

                    expect(result.id).to.be('dataproductId');
                    expect(result.contractId).to.be('contractId');
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
                )
                ;
                return dataProducts.getDataProducts('contractId', '').then((result) => {
                    expect(result.items.length).to.be(2);
                    expect(result.items[0].domains[0].name).to.be('data-admin-test1');
                    expect(result.items[0].domains[0].environment).to.be('TEST');
                    expect(result.items[1].domains[0].name).to.be('data-admin-test2');
                    expect(result.items[1].domains[0].environment).to.be('TEST');

                    expect(result.items[0].id).to.be('dataproductId');
                    expect(result.items[1].id).to.be('dataproductId1');

                    expect(result.items[0].contractId).to.be('contractId');
                    expect(result.items[1].contractId).to.be('contractId');
                });
            });

            it('should create dataproduct', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/dataproducts',
                    'POST',
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
                    expect(result.status).to.be(201);
                });
            });
        });
    });
});
