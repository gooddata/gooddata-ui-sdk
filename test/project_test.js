// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
/* eslint func-names: 0*/
import * as project from '../src/project';

describe('project', () => {
    let server;
    describe('with fake server', () => {
        beforeEach(function() {
            server = sinon.fakeServer.create();
            server.autoRespond = true;
        });

        afterEach(function() {
            server.restore();
        });

        describe('getProjects', () => {
            it('should reject with 400 when resource fails', done => {
                server.respondWith(
                    '/gdc/account/profile/myProfileId/projects',
                    [400, {'Content-Type': 'application/json'}, '']
                );
                project.getProjects('myProfileId').then(function() {
                    expect().fail('Should reject with 400');
                    done();
                }, function(err) {
                    expect(err.status).to.be(400);
                    done();
                });
            });
            it('should return an array of projects', done => {
                server.respondWith(
                    '/gdc/account/profile/myProfileId/projects',
                    [200, {'Content-Type': 'application/json'},
                    JSON.stringify({projects: [{project: {meta: {title: 'p1'}}},
                                            {project: {meta: {title: 'p2'}}}]})]
                );
                project.getProjects('myProfileId').then(function(result) {
                    expect(result.length).to.be(2);
                    expect(result[1].meta.title).to.be('p2');
                    done();
                });
            });
        });

        describe('getDatasets', () => {
            it('should reject with 400 when resource fails', done => {
                server.respondWith(
                    '/gdc/md/myFakeProjectId/query/datasets',
                    [400, {'Content-Type': 'application/json'}, '']
                );
                project.getDatasets('myFakeProjectId').then(function() {
                    expect().fail('Should reject with 400');
                    done();
                }, function(err) {
                    expect(err.status).to.be(400);
                    done();
                });
            });

            it('should return an array of dataSets', done => {
                server.respondWith(
                    '/gdc/md/myFakeProjectId/query/datasets',
                    [200, {'Content-Type': 'application/json'},
                    JSON.stringify({query: {entries: [{}, {}]}})]
                );
                project.getDatasets('myFakeProjectId').then(function resolve(result) {
                    expect(result.length).to.be(2);
                    done();
                });
            });
        });


        describe('getColorPalette', () => {
            it('should reject with 400 when resource fails', done => {
                server.respondWith(
                    '/gdc/projects/myFakeProjectId/styleSettings',
                    [400, {'Content-Type': 'application/json'}, '']
                );
                project.getColorPalette('myFakeProjectId').then(function() {
                    expect().fail('Should reject with 400');
                    done();
                }, function(err) {
                    expect(err.status).to.be(400);
                    done();
                });
            });
            it('should return an array of color objects in the right order', done => {
                server.respondWith(
                    '/gdc/projects/myFakeProjectId/styleSettings',
                    [200, {'Content-Type': 'application/json'},
                    JSON.stringify({styleSettings: {chartPalette: [
                        {guid: 'guid1', fill: {r: 1, b: 1, g: 1}},
                        {guid: 'guid2', fill: {r: 2, b: 2, g: 2}}
                    ]}})]
                );
                project.getColorPalette('myFakeProjectId').then(function(result) {
                    expect(result.length).to.be(2);
                    expect(result[0].r).to.be(1);
                    expect(result[1].r).to.be(2);
                    done();
                });
            });
        });

        describe('setColorPalette', () => {
            it('should reject with 400 when resource fails', done => {
                server.respondWith(
                    '/gdc/projects/myFakeProjectId/styleSettings',
                    [400, {'Content-Type': 'application/json'}, '']
                );
                project.setColorPalette('myFakeProjectId', []).then(function() {
                    expect().fail('Should reject with 400');
                    done();
                }, function(err) {
                    expect(err.status).to.be(400);
                    done();
                });
            });
        });

        describe('getCurrentProjectId', () => {
            it('should resolve with project id', done => {
                server.respondWith('GET', '', [200, {'Content-Type': 'application/json'}, JSON.stringify(
                    {bootstrapResource: {current: {project: {links: {self: '/gdc/project/project_hash'}}}}}
                )]);

                project.getCurrentProjectId().then(function(result) {
                    expect(result).to.be('project_hash');
                    done();
                }, function() {
                    expect().fail('Should resolve with project hash');
                    done();
                });
            });

            it('should resolve with null if current project not set', done => {
                server.respondWith(
                    'GET',
                    '',
                    [200, {'Content-Type': 'application/json'}, JSON.stringify({bootstrapResource: {current: {project: null}}})]
                );

                project.getCurrentProjectId().then(function(result) {
                    expect(result).to.be(null);
                    done();
                }, function() {
                    expect().fail('Should resolve with project hash');
                    done();
                });
            });
        });

        describe('getTimezone', () => {
            it('should return timezone using bootstrap', done => {
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

                server.respondWith('GET', bootstrapUrl, [
                    200,
                    { 'Content-Type': 'application/json' },
                    JSON.stringify(bootstrap)
                ]);

                project.getTimezone('prjId').then(function(timezone) {
                    expect(timezone).to.eql(timezoneMock);
                    done();
                }, function() {
                    expect().fail('Should resolve with current timezone');
                    done();
                });
            });
        });

        describe('setTimezone', () => {
            it('should save project timezone', done => {
                const timezoneUrl = '/gdc/md/prjId/service/timezone';
                const responseJSON = {
                    service: { timezone: 'Europe/Prague' }
                };

                server.respondWith('POST', timezoneUrl, [
                    200,
                    { 'Content-Type': 'application/json' },
                    JSON.stringify(responseJSON)
                ]);

                /*eslint-disable no-multi-spaces*/
                project.setTimezone('prjId', 'Europe/Prague').then(function(response)  {
                    expect(response).to.eql(responseJSON);
                    done();
                }, function() {
                    expect().fail('Should resolve with current timezone');
                    done();
                });
                /*eslint-enable no-multi-spaces*/
            });
        });
    });
});

