// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
define(['user'], function(user) {
    describe('user', function() {
        describe('with fake server', function() {
            beforeEach(function() {
                this.server = sinon.fakeServer.create();
                this.server.autoRespond = true;
            });

            afterEach(function() {
                this.server.restore();
                delete this.server;
            });

            describe("login", function() {
                it('resolves with userLogin using valid credential', function(done) {
                    this.server.respondWith(
                        'POST',
                        '/gdc/account/login',
                        [200, {'Content-Type' : 'application/json'}, JSON.stringify({"userLogin":{"profile":"/gdc/account/profile/abcd","state":"/gdc/account/login/abcd"}})]
                    );

                    user.login('login', 'pass').then(function(result) {
                        expect(result).to.eql({"userLogin": {"profile": "/gdc/account/profile/abcd", "state": "/gdc/account/login/abcd"}});
                        done();
                    });
                });

                it('rejects with bad credentials', function(done) {
                    this.server.respondWith(
                        'POST',
                        '/gdc/account/login',
                        [400, {'Content-Type': 'application/json'}, ""]
                    );

                    user.login('bad', 'creds').then(function() {
                        expect().fail('Promise should reject with 400 Bad Request error');
                        done();
                    }, function(err) {
                        expect(err.status).to.be(400);
                        done();
                    });
                });
            });

            describe("isLoggedIn", function() {
                it('should resolve if user logged in', function(done) {
                    this.server.respondWith(
                        'GET', '/gdc/account/token',
                        [200, {'Content-Type': 'text/html'}, JSON.stringify({})]
                    );
                    user.isLoggedIn().then(function(result) {
                        expect(result).to.eql({});
                        done();
                    }, function(err) {
                        expect().fail("Promise should be resolved with empty object");
                        done();
                    });
                });
                it('should reject with 401 if user not logged in', function(done) {
                    this.server.respondWith(
                        'GET', '/gdc/account/token',
                        [401, {'Content-Type': 'application/json'}, JSON.stringify({})]
                    );
                    user.isLoggedIn().then(function() {
                        expect().fail("Promise should be rejected with 401 Not Authorized");
                        done();
                    }, function(err) {
                        expect(err.status).to.be(401);
                        done();
                    });
                });
            });

            describe('loggedOut', function() {
                it('should resolve when user is not logged in', function(done) {
                    this.server.respondWith(
                        'GET', '/gdc/account/token',
                        [401, {'Content-Type': 'application/json'}, JSON.stringify({})]
                    );

                    user.logout().then(function(result) {
                        done();
                    }, function(err) {
                        expect().fail("Promise should be resolved with empty object");
                        done();
                    });
                });

                it('should log out user', function(done) {
                    var userId = 'USER_ID';

                    this.server.respondWith(
                        'GET', '/gdc/account/token',
                        [200, {'Content-Type': 'application/json'}, JSON.stringify({})]
                    );

                    this.server.respondWith(
                        'GET', '/gdc/app/account/bootstrap',
                        [200, {'Content-Type': 'application/json'}, JSON.stringify({
                            bootstrapResource: {
                                accountSetting: {
                                    links: {
                                        self: "/gdc/account/profile/" + userId
                                    }
                                }
                            }
                        })]
                    );

                    this.server.respondWith(
                        'DELETE', '/gdc/account/login/' + userId,
                        [204, {'Content-Type': 'application/json'}, '']
                    );

                    user.logout().then(function(result) {
                        done();
                    }, function(err) {
                        expect().fail("Promise should be resolved with empty object");
                        done();
                    });
                });
            });

            describe('Account info', function() {
                it('should return info about account', function(done) {
                    var login = 'LOGIN';
                    var loginMD5 = 'LOGIN_MD5';
                    var firstName = 'FIRST_NAME';
                    var lastName = 'LAST_NAME';
                    var organizationName = 'ORG_NAME';
                    var profileUri = 'PROFILE_URI';

                    this.server.respondWith(
                        'GET','/gdc/app/account/bootstrap',
                        [200, {'Content-Type': 'application/json'}, JSON.stringify({
                            bootstrapResource: {
                                accountSetting: {
                                    login: login,
                                    firstName: firstName,
                                    lastName: lastName,
                                    links: {
                                        self: profileUri
                                    }
                                },
                                current: {
                                    loginMD5: loginMD5
                                },
                                settings: {
                                    organizationName: organizationName
                                }
                            }
                        })]
                    );

                    user.getAccountInfo().then(function(accountInfo) {
                        expect(accountInfo.login).to.eql(login);
                        expect(accountInfo.loginMD5).to.eql(loginMD5);
                        expect(accountInfo.firstName).to.eql(firstName);
                        expect(accountInfo.lastName).to.eql(lastName);
                        expect(accountInfo.organizationName).to.eql(organizationName);
                        expect(accountInfo.profileUri).to.eql(profileUri);

                        done();
                    });
                });
            });
        });

    });
});

