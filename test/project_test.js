// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import * as project from '../src/project';
import fetchMock from 'fetch-mock';

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
                        body: JSON.stringify({projects: [{project: {meta: {title: 'p1'}}},
                                                {project: {meta: {title: 'p2'}}}]})
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
                        body: JSON.stringify({query: {entries: [{}, {}]}})
                    }
                );
                return project.getDatasets('myFakeProjectId').then(result => {
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
                        body: JSON.stringify({styleSettings: {chartPalette: [
                            {guid: 'guid1', fill: {r: 1, b: 1, g: 1}},
                            {guid: 'guid2', fill: {r: 2, b: 2, g: 2}}
                        ]}})
                    }
                );
                return project.getColorPalette('myFakeProjectId').then(result => {
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
                fetchMock.mock('/gdc/app/account/bootstrap', 'GET', { status: 200, body: JSON.stringify(
                    {bootstrapResource: {current: {project: {links: {self: '/gdc/project/project_hash'}}}}}
                )});

                return project.getCurrentProjectId().then(result => {
                    expect(result).to.be('project_hash');
                });
            });

            it('should resolve with null if current project not set', () => {
                fetchMock.mock(
                    '/gdc/app/account/bootstrap',
                    'GET',
                    { status: 200, body: JSON.stringify({bootstrapResource: {current: {project: null}}}) }
                );

                return project.getCurrentProjectId().then(result => {
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
    });
});

