// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import fetchMock from './utils/fetch-mock';
import * as project from '../src/project';

describe('project', () => {
    describe('with fake server', () => {
        afterEach(() => {
            fetchMock.restore();
        });

        describe('getProjects', () => {
            it('should reject with 400 when resource fails', () => {
                fetchMock.mock(
                    '/gdc/account/profile/myProfileId/projects',
                    400
                );
                return project.getProjects('myProfileId').then(null, err => expect(err).to.be.an(Error));
            });
            it('should return an array of projects', () => {
                fetchMock.mock(
                    '/gdc/account/profile/myProfileId/projects',
                    {
                        status: 200,
                        body: JSON.stringify({ projects: [{ project: { meta: { title: 'p1' } } },
                                                { project: { meta: { title: 'p2' } } }] })
                    }
                );
                return project.getProjects('myProfileId').then((result) => {
                    expect(result.length).to.be(2);
                    expect(result[1].meta.title).to.be('p2');
                });
            });
        });

        describe('getDatasets', () => {
            it('should reject with 400 when resource fails', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/datasets',
                    400
                );
                return project.getDatasets('myFakeProjectId').then(null, err => expect(err).to.be.an(Error));
            });

            it('should return an array of dataSets', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/datasets',
                    {
                        status: 200,
                        body: JSON.stringify({ query: { entries: [{}, {}] } })
                    }
                );
                return project.getDatasets('myFakeProjectId').then((result) => {
                    expect(result.length).to.be(2);
                });
            });
        });

        describe('getColorPalette', () => {
            it('should reject with 400 when resource fails', () => {
                fetchMock.mock(
                    '/gdc/projects/myFakeProjectId/styleSettings',
                    400
                );
                return project.getColorPalette('myFakeProjectId').then(null, err => expect(err).to.be.an(Error));
            });
            it('should return an array of color objects in the right order', () => {
                fetchMock.mock(
                    '/gdc/projects/myFakeProjectId/styleSettings',
                    {
                        status: 200,
                        body: JSON.stringify({ styleSettings: { chartPalette: [
                            { guid: 'guid1', fill: { r: 1, b: 1, g: 1 } },
                            { guid: 'guid2', fill: { r: 2, b: 2, g: 2 } }
                        ] } })
                    }
                );
                return project.getColorPalette('myFakeProjectId').then((result) => {
                    expect(result.length).to.be(2);
                    expect(result[0].r).to.be(1);
                    expect(result[1].r).to.be(2);
                });
            });
        });

        describe('setColorPalette', () => {
            it('should reject with 400 when resource fails', () => {
                fetchMock.mock(
                    '/gdc/projects/myFakeProjectId/styleSettings',
                    400
                );
                return project.setColorPalette('myFakeProjectId', []).then(null, err => expect(err).to.be.an(Error));
            });
        });

        describe('getCurrentProjectId', () => {
            it('should resolve with project id', () => {
                fetchMock.mock('/gdc/app/account/bootstrap', 'GET', {
                    status: 200,
                    body: JSON.stringify({
                        bootstrapResource: {
                            current: {
                                project: {
                                    links: { self: '/gdc/project/project_hash' }
                                }
                            }
                        }
                    })
                });

                return project.getCurrentProjectId().then((result) => {
                    expect(result).to.be('project_hash');
                });
            });

            it('should resolve with null if current project not set', () => {
                fetchMock.mock(
                    '/gdc/app/account/bootstrap',
                    'GET',
                    { status: 200, body: JSON.stringify({ bootstrapResource: { current: { project: null } } }) }
                );

                return project.getCurrentProjectId().then((result) => {
                    expect(result).to.be(null);
                });
            });
        });

        describe('getTimezone', () => {
            it('should return timezone using bootstrap', () => {
                const bootstrapUrl = '/gdc/app/account/bootstrap?projectId=prjId';
                const timezoneMock = {
                    id: 'Europe/Prague',
                    displayName: 'Central European Time',
                    currentOffsetMs: 3600000
                };
                const bootstrap = {
                    bootstrapResource: {
                        current: {
                            timezone: timezoneMock
                        }
                    }
                };

                fetchMock.mock(bootstrapUrl, 'GET', {
                    status: 200,
                    body: JSON.stringify(bootstrap)
                });

                return project.getTimezone('prjId').then((timezone) => {
                    expect(timezone).to.eql(timezoneMock);
                });
            });
        });

        describe('setTimezone', () => {
            it('should save project timezone', () => {
                const timezoneUrl = '/gdc/md/prjId/service/timezone';
                const responseJSON = {
                    service: { timezone: 'Europe/Prague' }
                };

                fetchMock.mock(
                    timezoneUrl,
                    'POST',
                    {
                        status: 200,
                        body: JSON.stringify(responseJSON)
                    }
                );

                return project.setTimezone('prjId', 'Europe/Prague').then((response) => {
                    expect(response).to.eql(responseJSON);
                });
            });
        });

        describe('createProject', () => {
            const mockProject = state => ({
                project: {
                    content: {
                        state
                    }
                }
            });

            const createdProject = mockProject('ENABLED');
            const pendingProject = mockProject('PREPARING');
            const deletedProject = mockProject('DELETED');
            const projectUri = '/gdc/projects/1';
            const createProjectResponse = {
                uri: projectUri
            };

            describe('/gdc/projects call successful', () => {
                function mockIntialPost(customCheck = () => {}) {
                    fetchMock.mock(
                        '/gdc/projects',
                        'POST',
                        (url, options) => {
                            customCheck(options);
                            return {
                                status: 200,
                                body: JSON.stringify(createProjectResponse)
                            };
                        }
                    );
                }

                it('should preset default values', () => {
                    mockIntialPost((options) => {
                        const params = JSON.parse(options.body);
                        expect(params.project.content.guidedNavigation).to.eql(1);
                        expect(params.project.content.driver).to.eql('Pg');
                        expect(params.project.content.environment).to.eql('TESTING');
                    });

                    fetchMock.mock(
                        projectUri,
                        'GET',
                        {
                            status: 200,
                            body: JSON.stringify(createdProject)
                        }
                    );

                    return project.createProject('Project', '1234').then((result) => {
                        expect(result).to.eql(createdProject);
                    });
                });

                it('should not poll for created project when enabled immediately', () => {
                    mockIntialPost();
                    fetchMock.mock(
                        projectUri,
                        'GET',
                        {
                            status: 200,
                            body: JSON.stringify(createdProject)
                        }
                    );

                    return project.createProject('Project', '1234').then((result) => {
                        expect(result).to.eql(createdProject);
                    });
                });

                it('should resolve and stop polling if created project ends in deleted state', () => {
                    mockIntialPost();
                    fetchMock.mock(
                        projectUri,
                        'GET',
                        {
                            status: 200,
                            body: JSON.stringify(deletedProject)
                        }
                    );

                    return project.createProject('Project', '1234').then((result) => {
                        expect(result).to.eql(deletedProject);
                    });
                });

                it('should poll until project status is ENABLED', () => {
                    mockIntialPost();
                    let counter = 0;

                    fetchMock.mock(
                        projectUri,
                        'GET',
                        () => {
                            counter += 1;
                            const response = counter > 3 ? createdProject : pendingProject;

                            return {
                                status: 200,
                                body: JSON.stringify(response)
                            };
                        }
                    );

                    return project.createProject('Project', '1234', { pollStep: 1 }).then((result) => {
                        expect(result).to.eql(createdProject);
                    });
                });

                it('should reject if maximum polling attempts reached', () => {
                    mockIntialPost();
                    let counter = 0;

                    fetchMock.mock(
                        projectUri,
                        'GET',
                        () => {
                            counter += 1;
                            const response = counter > 3 ? createdProject : pendingProject;

                            return {
                                status: 200,
                                body: JSON.stringify(response)
                            };
                        }
                    );

                    const config = { pollStep: 1, maxAttempts: 1 };
                    return project.createProject('Project', '1234', config).then(() => {
                        expect().fail('Should reject the promise if create project ended with 400');
                    }, (err) => {
                        expect(err).to.be.an(Error);
                    });
                });
            });

            describe('/gdc/projects call not successful', () => {
                it('should reject if create dashboard call fails', () => {
                    fetchMock.mock(
                        '/gdc/projects',
                        'POST',
                        {
                            status: 400,
                            body: JSON.stringify({})
                        }
                    );

                    return project.createProject('Project', '1234').then(() => {
                        expect().fail('Should reject the promise if create project ended with 400');
                    }, (err) => {
                        expect(err).to.be.an(Error);
                    });
                });
            });
        });
    });
});
