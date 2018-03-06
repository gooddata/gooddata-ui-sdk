// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import fetchMock from '../utils/fetch-mock';
import * as domaindataproducts from '../../src/admin/domainDataProducts';

describe('domainDataProducts', () => {
    describe('with fake server', () => {
        describe('getDomainDataProducts', () => {
            afterEach(() => {
                fetchMock.restore();
            });

            it('should reject with 400 when resource fails', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/dataproducts/dataProductId/domaindataproducts',
                    400
                );

                return domaindataproducts.getDomainDataProducts('contractId', 'dataProductId').then(null, err => expect(err).toBeInstanceOf(Error));
            });

            it('should return domaindataproducts', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/dataproducts/dataProductId/domaindataproducts',
                    {
                        status: 200,
                        body: JSON.stringify({
                            domainDataProducts: {
                                items: [{
                                    domainDataProduct: {
                                        id: 'dataproductId',
                                        domain: {
                                            name: 'data-admin-test1',
                                            environment: 'TEST'
                                        },
                                        links: {
                                            dataProduct: '/gdc/admin/contracts/contractId/dataproducts/dataproductId',
                                            domain: '/gdc/admin/contracts/contractId/domains/data-admin-test1',
                                            domainSegments: ['/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments'],
                                            self: 'gdc/admin/contracts/contractId/dataproducts/dataproductId/domaindataproducts/data-admin-test1'
                                        }
                                    }
                                }]
                            }
                        })
                    }
                );
                return domaindataproducts.getDomainDataProducts('contractId', 'dataProductId').then((result) => {
                    expect(result.items.length).toBe(1);
                    expect(result.items[0].domain.name).toBe('data-admin-test1');
                    expect(result.items[0].domain.environment).toBe('TEST');

                    expect(result.items[0].id).toBe('dataproductId');
                });
            });
        });
    });
});
