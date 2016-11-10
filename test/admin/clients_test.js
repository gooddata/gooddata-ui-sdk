// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import fetchMock from '../utils/fetch-mock';
import * as clients from '../../src/admin/clients';

describe('project', () => {
    describe('with fake server', () => {
        afterEach(() => {
            fetchMock.restore();
        });

        describe('getClientUsers', () => {
            const clientUsersPayload = JSON.stringify({
                clientUsers: {
                    items: [
                        {
                            firstName: 'joe',
                            lastName: 'black',
                            login: 'joe.black@gd.com',
                            roles: ['admin']
                        },
                        {
                            firstName: 'noe',
                            lastName: 'red',
                            login: 'noe.red@gd.com',
                            roles: ['user']
                        }
                    ],
                    paging: {}
                }
            });

            it('should reject with 400 when client users resource fails', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId/domainsegments/domainId/clients/clientId/project/users',
                    400
                );

                return clients.getClientUsers('contractId', 'dataproductId', 'domainId', 'segmentId', 'clientId', null, null).then(null, err => expect(err).to.be.an(Error));
            });

            it('should return client users', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId/domainsegments/domainId/clients/clientId/project/users',
                    {
                        status: 200,
                        body: clientUsersPayload
                    }
                );

                return clients.getClientUsers('contractId', 'dataproductId', 'domainId', 'segmentId', 'clientId', null, null).then((result) => {
                    expect(result.items.length).to.be(2);
                    expect(result.items[0].fullName).to.be('joe black');
                    expect(result.items[1].fullName).to.be('noe red');
                });
            });

            it('should use paging', () => {
                fetchMock.mock(
                    '/gdc/admin/xxx',
                    {
                        status: 200,
                        body: clientUsersPayload
                    }
                );

                const paging = { next: '/gdc/admin/xxx' };
                return clients.getClientUsers('contractId', 'dataproductId', 'domainId', 'segmentId', 'clientId', null, paging).then((result) => {
                    expect(result.items.length).to.be(2);
                    expect(result.items[0].fullName).to.be('joe black');
                    expect(result.items[1].fullName).to.be('noe red');
                });
            });
        });

        describe('getClient', () => {
            it('should reject with 400 when client resource fails', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId/domainsegments/domainId/clients/clientId?stats=user',
                    400
                );

                return clients.getClient('contractId', 'dataproductId', 'segmentId', 'domainId', 'clientId').then(null, err => expect(err).to.be.an(Error));
            });

            it('should return client', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId/domainsegments/domainId/clients/clientId?stats=user',
                    {
                        status: 200,
                        body: JSON.stringify({
                            client: {
                                id: 'clientId',
                                referencedProject: {
                                    project: {
                                        id: 'projectId'
                                    }
                                },
                                links: {
                                    self: '/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId/domainsegments/domainId/clients/clientId'
                                }
                            }
                        })
                    }
                );

                return clients.getClient('contractId', 'dataproductId', 'segmentId', 'domainId', 'clientId').then((result) => {
                    expect(result.id).to.be('clientId');
                    expect(result.contractId).to.be('contractId');
                    expect(result.domainId).to.be('domainId');
                    expect(result.dataProductId).to.be('dataproductId');
                    expect(result.segmentId).to.be('segmentId');

                    expect(result.referencedProject.project.id).to.be('projectId');
                });
            });
        });

        describe('getClients', () => {
            const clientsPayload = JSON.stringify({
                clients: {
                    items: [
                        {
                            client: {
                                id: 'clientId1',
                                referencedProject: {
                                    project: {
                                        id: 'projectId'
                                    }
                                },
                                links: {
                                    self: '/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId/domainsegments/domainId/clients/clientId1'
                                }
                            }
                        },
                        {
                            client: {
                                id: 'clientId2',
                                referencedProject: {
                                    project: {
                                        id: 'projectId'
                                    }
                                },
                                links: {
                                    self: '/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId/domainsegments/domainId/clients/clientId2'
                                }
                            }
                        }
                    ],
                    paging: {
                        count: 2
                    }
                }
            });

            it('should reject with 400 when clients resource fails', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId/domainsegments/domainId/clients',
                    400
                );

                return clients.getClients('contractId', 'dataproductId', 'segmentId', 'domainId').then(null, err => expect(err).to.be.an(Error));
            });

            it('should return clients', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId/domainsegments/domainId/clients?stats=user',
                    {
                        status: 200,
                        body: clientsPayload
                    }
                );

                return clients.getClients('contractId', 'dataproductId', 'segmentId', 'domainId', null, null).then((result) => {
                    expect(result.items.length).to.be(2);
                    expect(result.items[0].id).to.be('clientId1');
                    expect(result.items[1].id).to.be('clientId2');
                });
            });

            it('should return clients with prefix', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId/domainsegments/domainId/clients?clientPrefix=somePrefix&stats=user',
                    {
                        status: 200,
                        body: clientsPayload
                    }
                );

                return clients.getClients('contractId', 'dataproductId', 'segmentId', 'domainId', 'somePrefix', null).then((result) => {
                    expect(result.items.length).to.be(2);
                    expect(result.items[0].id).to.be('clientId1');
                    expect(result.items[1].id).to.be('clientId2');
                });
            });

            it('should use paging', () => {
                fetchMock.mock(
                    '/gdc/admin/xxx',
                    {
                        status: 200,
                        body: clientsPayload
                    }
                );
                const paging = { next: '/gdc/admin/xxx' };
                return clients.getClients('contractId', 'dataproductId', 'segmentId', 'domainId', null, paging).then((result) => {
                    expect(result.items.length).to.be(2);
                    expect(result.items[0].id).to.be('clientId1');
                    expect(result.items[1].id).to.be('clientId2');
                });
            });
        });
    });
});
