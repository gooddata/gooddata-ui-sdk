// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
define(['project', 'jquery'], function(project, $) {
    describe('project', function() {
        describe('with fake server', function() {
            beforeEach(function() {
                this.server = sinon.fakeServer.create();
                this.server.autoRespond = true;
            });

            afterEach(function() {
                this.server.restore();
                delete this.server;
            });

            describe('getProjects', function() {
                it('should reject with 400 when resource fails', function(done) {
                    this.server.respondWith(
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
                it('should return an array of projects', function(done) {
                    this.server.respondWith(
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

            describe('getDatasets', function() {
                it('should reject with 400 when resource fails', function(done) {
                    this.server.respondWith(
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

                it('should return an array of dataSets', function(done) {
                    this.server.respondWith(
                        '/gdc/md/myFakeProjectId/query/datasets',
                        [200, {'Content-Type': 'application/json'},
                        JSON.stringify({query: {entries: [{}, {}]}})]
                    );
                    project.getDatasets('myFakeProjectId').then(function(result) {
                        expect(result.length).to.be(2);
                        done();
                    });
                });
            });


            describe('getColorPalette', function() {
                it('should reject with 400 when resource fails', function(done) {
                    this.server.respondWith(
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
                it('should return an array of color objects in the right order', function(done) {
                    this.server.respondWith(
                        '/gdc/projects/myFakeProjectId/styleSettings',
                        [200, {'Content-Type': 'application/json'},
                        JSON.stringify({styleSettings: {chartPalette: [
                            {guid: 'guid1', fill: {r:1, b:1, g:1}},
                            {guid: 'guid2', fill: {r:2, b:2, g:2}}
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

            describe('setColorPalette', function() {
                it('should reject with 400 when resource fails', function(done) {
                    this.server.respondWith(
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

            describe('getCurrentProjectId', function() {
                it('should resolve with project id', function(done) {
                    this.server.respondWith(
                        'GET', '',
                        [200, {'Content-Type': 'application/json'}, JSON.stringify({bootstrapResource: {current: {project: {links: {self: '/gdc/project/project_hash'}}}}})]
                    );

                    project.getCurrentProjectId().then(function(result) {
                        expect(result).to.be('project_hash');
                        done();
                    }, function() {
                        expect().fail('Should resolve with project hash');
                        done();
                    });
                });

                it('should resolve with null if current project not set', function(done) {
                    this.server.respondWith(
                        'GET', '',
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

            describe('getTimezone', function() {
                it('should return timezone using bootstrap', function(done) {
                    var bootstrapUrl = '/gdc/app/account/bootstrap?projectId=prjId';
                    var timezoneMock = {
                        id: 'Europe/Prague',
                        displayName: 'Central European Time',
                        currentOffsetMs: 3600000
                    };
                    var bootstrap = {
                        bootstrapResource: {
                            current: {
                                timezone: timezoneMock
                            }
                        }
                    };

                    this.server.respondWith('GET', bootstrapUrl, [
                        200,
                        { 'Content-Type': 'application/json' },
                        JSON.stringify(bootstrap)
                    ]);

                    project.getTimezone('prjId').then(function(timezone)  {
                        expect(timezone).to.eql(timezoneMock);
                        done();
                    }, function() {
                        expect().fail('Should resolve with current timezone');
                        done();
                    });
                });
            });

            describe('setTimezone', function() {
                it('should save project timezone', function(done) {
                    var timezoneUrl = '/gdc/md/prjId/service/timezone';
                    var responseJSON = {
                        service: { timezone: 'Europe/Prague' }
                    };

                    this.server.respondWith('POST', timezoneUrl, [
                        200,
                        { 'Content-Type': 'application/json' },
                        JSON.stringify(responseJSON)
                    ]);

                    project.setTimezone('prjId', 'Europe/Prague').then(function(response)  {
                        expect(response).to.eql(responseJSON);
                        done();
                    }, function() {
                        expect().fail('Should resolve with current timezone');
                        done();
                    });
                });
            });
        });
    });
});

