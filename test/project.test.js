// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import fetchMock from './utils/fetch-mock';
import { mockPollingRequest } from './helpers/polling';
import { createModule as projectFactory } from '../src/project';
import { createModule as xhrFactory } from '../src/xhr';
import { createModule as configFactory } from '../src/config';

const config = configFactory();
const xhr = xhrFactory(config);
const project = projectFactory(xhr);

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
                return project.getProjects('myProfileId').then(null, err => expect(err).toBeInstanceOf(Error));
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
                    expect(result.length).toBe(2);
                    expect(result[1].meta.title).toBe('p2');
                });
            });
        });

        describe('getDatasets', () => {
            it('should reject with 400 when resource fails', () => {
                fetchMock.mock(
                    '/gdc/md/myFakeProjectId/query/datasets',
                    400
                );
                return project.getDatasets('myFakeProjectId').then(null, err => expect(err).toBeInstanceOf(Error));
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
                    expect(result.length).toBe(2);
                });
            });
        });

        describe('getColorPalette', () => {
            it('should reject with 400 when resource fails', () => {
                fetchMock.mock(
                    '/gdc/projects/myFakeProjectId/styleSettings',
                    400
                );
                return project.getColorPalette('myFakeProjectId').then(null, err => expect(err).toBeInstanceOf(Error));
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
                    expect(result.length).toBe(2);
                    expect(result[0].r).toBe(1);
                    expect(result[1].r).toBe(2);
                });
            });
        });

        describe('setColorPalette', () => {
            it('should reject with 400 when resource fails', () => {
                fetchMock.mock(
                    '/gdc/projects/myFakeProjectId/styleSettings',
                    400
                );
                return project.setColorPalette('myFakeProjectId', []).then(null, err => expect(err).toBeInstanceOf(Error));
            });
        });

        describe('getCurrentProjectId', () => {
            it('should resolve with project id', () => {
                fetchMock.mock('/gdc/app/account/bootstrap', {
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
                    expect(result).toBe('project_hash');
                });
            });

            it('should resolve with null if current project not set', () => {
                fetchMock.mock(
                    '/gdc/app/account/bootstrap',
                    { status: 200, body: JSON.stringify({ bootstrapResource: { current: { project: null } } }) }
                );

                return project.getCurrentProjectId().then((result) => {
                    expect(result).toBe(null);
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

                fetchMock.mock(bootstrapUrl, {
                    status: 200,
                    body: JSON.stringify(bootstrap)
                });

                return project.getTimezone('prjId').then((timezone) => {
                    expect(timezone).toEqual(timezoneMock);
                });
            });
        });

        describe('setTimezone', () => {
            it('should save project timezone', () => {
                const timezoneUrl = '/gdc/md/prjId/service/timezone';
                const responseJSON = {
                    service: { timezone: 'Europe/Prague' }
                };

                fetchMock.post(
                    timezoneUrl,
                    {
                        status: 200,
                        body: JSON.stringify(responseJSON)
                    }
                );

                return project.setTimezone('prjId', 'Europe/Prague').then((response) => {
                    expect(response).toEqual(responseJSON);
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
                    fetchMock.post(
                        '/gdc/projects',
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
                        expect(params.project.content.guidedNavigation).toEqual(1);
                        expect(params.project.content.driver).toEqual('Pg');
                        expect(params.project.content.environment).toEqual('TESTING');
                    });

                    fetchMock.mock(
                        projectUri,
                        {
                            status: 200,
                            body: JSON.stringify(createdProject)
                        }
                    );

                    return project.createProject('Project', '1234').then((result) => {
                        expect(result).toEqual(createdProject);
                    });
                });

                it('should not poll for created project when enabled immediately', () => {
                    mockIntialPost();
                    fetchMock.mock(
                        projectUri,
                        {
                            status: 200,
                            body: JSON.stringify(createdProject)
                        }
                    );

                    return project.createProject('Project', '1234').then((result) => {
                        expect(result).toEqual(createdProject);
                    });
                });

                it('should resolve and stop polling if created project ends in deleted state', () => {
                    mockIntialPost();
                    fetchMock.mock(
                        projectUri,
                        {
                            status: 200,
                            body: JSON.stringify(deletedProject)
                        }
                    );

                    return project.createProject('Project', '1234').then((result) => {
                        expect(result).toEqual(deletedProject);
                    });
                });

                it('should poll until project status is ENABLED', () => {
                    mockIntialPost();

                    mockPollingRequest(projectUri, pendingProject, createdProject);

                    return project.createProject('Project', '1234', { pollStep: 1 }).then((result) => {
                        expect(result).toEqual(createdProject);
                    });
                });

                it('should reject if maximum polling attempts reached', () => {
                    mockIntialPost();

                    mockPollingRequest(projectUri, pendingProject, createdProject);

                    const options = { pollStep: 1, maxAttempts: 1 };
                    return project.createProject('Project', '1234', options).then(() => {
                        throw new Error('Should reject the promise if create project ended with 400');
                    }, (err) => {
                        expect(err).toBeInstanceOf(Error);
                    });
                });
            });

            describe('/gdc/projects call not successful', () => {
                it('should reject if create dashboard call fails', () => {
                    fetchMock.post(
                        '/gdc/projects',
                        {
                            status: 400,
                            body: JSON.stringify({})
                        }
                    );

                    return project.createProject('Project', '1234').then(() => {
                        throw new Error('Should reject the promise if create project ended with 400');
                    }, (err) => {
                        expect(err).toBeInstanceOf(Error);
                    });
                });
            });
        });

        describe('deleteProject', () => {
            it('should delete project', () => {
                const projectId = 'myFakeProjectId';

                fetchMock.delete(
                    `/gdc/projects/${projectId}`,
                    200
                );

                return project.deleteProject(projectId).then(r => expect(r.ok).toBeTruthy());
            });
        });
    });
});
