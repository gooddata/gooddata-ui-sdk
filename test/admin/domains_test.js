// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import fetchMock from '../utils/fetch-mock';
import * as domains from '../../src/admin/domains';

describe('project', () => {
    describe('with fake server', () => {
        afterEach(() => {
            fetchMock.restore();
        });

        describe('getDomain', () => {
            it('should reject with 400 when domain resource fails', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId',
                    400
                );

                return domains.getDomain('contractId', 'domainId', null, null).then(null, err => expect(err).to.be.an(Error));
            });

            it('should return domain', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId',
                    {
                        status: 200,
                        body: JSON.stringify({
                            domain: {
                                name: 'domainId',
                                hostname: 'domainId.intgdc.com',
                                environment: 'TESTING',
                                links: {
                                    self: '/gdc/admin/contracts/contractId/domains/domainId',
                                    users: '/gdc/admin/contracts/contractId/domains/domainId/users',
                                    projects: '/gdc/admin/contracts/contractId/domains/domainId/projects'
                                }
                            }
                        })
                    }
                );

                return domains.getDomain('contractId', 'domainId', null).then((result) => {
                    expect(result.name).to.be('domainId');
                    expect(result.id).to.be('domainId');
                    expect(result.contractId).to.be('contractId');
                });
            });
        });

        describe('getDomains', () => {
            it('should reject with 400 when domains resource fails', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains',
                    400
                );

                return domains.getDomain('contractId', 'domainId', null, null).then(null, err => expect(err).to.be.an(Error));
            });

            it('should return domains', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains',
                    {
                        status: 200,
                        body: JSON.stringify({
                            domains: {
                                items: [
                                    {
                                        domain: {
                                            name: 'data-admin-test1',
                                            hostname: 'data-admin-test1-stg3.intgdc.com',
                                            environment: 'TESTING',
                                            links: {
                                                self: '/gdc/admin/contracts/contractId/domains/data-admin-test1',
                                                users: '/gdc/admin/contracts/contractId/domains/data-admin-test1/users',
                                                projects: '/gdc/admin/contracts/contractId/domains/data-admin-test1/projects'
                                            }
                                        }
                                    },
                                    {
                                        domain: {
                                            name: 'data-admin-test2',
                                            hostname: 'data-admin-test2-stg3.intgdc.com',
                                            environment: 'TESTING',
                                            links: {
                                                self: '/gdc/admin/contracts/contractId/domains/data-admin-test2',
                                                users: '/gdc/admin/contracts/contractId/domains/data-admin-test2/users',
                                                projects: '/gdc/admin/contracts/contractId/domains/data-admin-test2/projects'
                                            }
                                        }
                                    }
                                ]
                            }
                        })
                    }
                );

                return domains.getDomains('contractId', null).then((result) => {
                    expect(result.items.length).to.be(2);
                    expect(result.items[0].id).to.be('data-admin-test1');
                    expect(result.items[1].id).to.be('data-admin-test2');
                });
            });
        });

        describe('getDomainProjects', () => {
            it('should reject with 400 when projects resource fails', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId/projects',
                    400
                );

                return domains.getDomainProjects('contractId', 'domainId', null, null).then(null, err => expect(err).to.be.an(Error));
            });

            it('should return domains projects', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId/projects',
                    {
                        status: 200,
                        body: JSON.stringify({
                            domainProjects: {
                                items: [{ project: { title: 'project0' } }, { project: { title: 'project1' } }],
                                paging: {}
                            }
                        })
                    }
                );

                return domains.getDomainProjects('contractId', 'domainId', null, null).then((result) => {
                    expect(result.items.length).to.be(2);
                    expect(result.items[0].title).to.be('project0');
                });
            });

            it('should returns empty domains projects', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId/projects',
                    {
                        status: 200,
                        body: JSON.stringify({
                            domainProjects: {
                                items: [{ project: { title: 'project0' } }, { project: { title: 'project1' } }],
                                paging: {}
                            }
                        })
                    }
                );

                return domains.getDomainProjects('contractId', 'domainId', null, { next: null }).then((result) => {
                    expect(result.items.length).to.be(0);
                });
            });

            it('should use paging next when getting result', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId/projects?limit=10',
                    {
                        status: 200,
                        body: JSON.stringify({
                            domainProjects: {
                                items: [{ project: { title: 'project0' } }, { project: { title: 'project1' } }],
                                paging: {}
                            }
                        })
                    }
                );

                return domains.getDomainProjects('contractId', 'domainId', null, { next: '/gdc/admin/contracts/contractId/domains/domainId/projects?limit=10' }).then((result) => {
                    expect(result.items.length).to.be(2);
                    expect(result.items[0].title).to.be('project0');
                });
            });
        });

        describe('getDomainUsers', () => {
            const usersPayload = JSON.stringify({
                domainUsers: {
                    items: [
                        { user: {
                            login: 'joe@foo.com',
                            firstName: 'joe',
                            lastName: 'black',
                            links: { domain: '/gdc/admin/contracts/contractId/domains/domainId/users' }
                        } },
                        { user: {
                            login: 'noe@foo.com',
                            firstName: 'noe',
                            lastName: 'red',
                            links: { domain: '/gdc/admin/contracts/contractId/domains/domainId/users' }
                        } }
                    ],
                    paging: {}
                }
            });

            it('should reject with 400 when resource fails', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId/users',
                    400
                );

                return domains.getDomainProjects('contractId', 'domainId', null, null).then(null, err => expect(err).to.be.an(Error));
            });

            it('should return domain users', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId/users',
                    {
                        status: 200,
                        body: usersPayload
                    }
                );

                return domains.getDomainUsers('contractId', 'domainId', null, null).then((result) => {
                    expect(result.items.length).to.be(2);
                    expect(result.items[0].firstName).to.be('joe');
                    expect(result.items[0].id).to.be('joe@foo.com');
                    expect(result.items[0].fullName).to.be('joe black');
                    expect(result.items[1].fullName).to.be('noe red');
                });
            });

            it('should returns empty domain users', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId/users',
                    {
                        status: 200,
                        body: usersPayload
                    }
                );

                return domains.getDomainUsers('contractId', 'domainId', null, { next: null }).then((result) => {
                    expect(result.items.length).to.be(0);
                });
            });

            it('should use paging next when getting result', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId/users?limit=10',
                    {
                        status: 200,
                        body: usersPayload
                    }
                );

                return domains.getDomainUsers('contractId', 'domainId', null, { next: '/gdc/admin/contracts/contractId/domains/domainId/users?limit=10' }).then((result) => {
                    expect(result.items.length).to.be(2);
                    expect(result.items[0].id).to.be('joe@foo.com');
                });
            });
        });
    });
});
