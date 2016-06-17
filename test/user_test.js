// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
/* eslint func-names: 0 */
import * as user from '../src/user';
describe('user', () => {
    let server;
    describe('with fake server', () => {
        beforeEach(function() {
            server = sinon.fakeServer.create();
            server.autoRespond = true;
        });

        afterEach(function() {
            server.restore();
        });

        describe('login', () => {
            it('resolves with userLogin using valid credential', done => {
                server.respondWith(
                    'POST',
                    '/gdc/account/login',
                    [200, {'Content-Type': 'application/json'}, JSON.stringify(
                        {'userLogin': {'profile': '/gdc/account/profile/abcd', 'state': '/gdc/account/login/abcd'}}
                    )]
                );

                user.login('login', 'pass').then(function(result) {
                    expect(result).to.eql(
                        {'userLogin': {'profile': '/gdc/account/profile/abcd', 'state': '/gdc/account/login/abcd'}}
                    );
                    done();
                });
            });

            it('rejects with bad credentials', done => {
                server.respondWith(
                    'POST',
                    '/gdc/account/login',
                    [400, {'Content-Type': 'application/json'}, '']
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

        describe('isLoggedIn', () => {
            it('should resolve if user logged in', done => {
                server.respondWith(
                    'GET',
                    '/gdc/account/token',
                    [200, {'Content-Type': 'text/html'}, JSON.stringify({})]
                );
                user.isLoggedIn().then(function(result) {
                    expect(result).to.eql({});
                    done();
                }, function(err) {
                    expect().fail('Promise should be resolved with empty object. ' + err);
                    done();
                });
            });
            it('should reject with 401 if user not logged in', done => {
                server.respondWith(
                    'GET',
                    '/gdc/account/token',
                    [401, {'Content-Type': 'application/json'}, JSON.stringify({})]
                );
                user.isLoggedIn().then(function() {
                    expect().fail('Promise should be rejected with 401 Not Authorized');
                    done();
                }, function(err) {
                    expect(err.status).to.be(401);
                    done();
                });
            });
        });

        describe('loggedOut', () => {
            it('should resolve when user is not logged in', done => {
                server.respondWith(
                    'GET',
                    '/gdc/account/token',
                    [401, {'Content-Type': 'application/json'}, JSON.stringify({})]
                );

                user.logout().then(function() {
                    done();
                }, function(err) {
                    expect().fail('Promise should be resolved with empty object. ' + err);
                    done();
                });
            });

            it('should log out user', done => {
                const userId = 'USER_ID';

                server.respondWith(
                    'GET',
                    '/gdc/account/token',
                    [200, {'Content-Type': 'application/json'}, JSON.stringify({})]
                );

                server.respondWith(
                    'GET',
                    '/gdc/app/account/bootstrap',
                    [200, {'Content-Type': 'application/json'}, JSON.stringify({
                        bootstrapResource: {
                            accountSetting: {
                                links: {
                                    self: '/gdc/account/profile/' + userId
                                }
                            }
                        }
                    })]
                );

                server.respondWith(
                    'DELETE',
                    '/gdc/account/login/' + userId,
                    [204, {'Content-Type': 'application/json'}, '']
                );

                user.logout().then(function() {
                    done();
                }, function(err) {
                    expect().fail('Promise should be resolved with empty object. ' + err);
                    done();
                });
            });
        });

        describe('updateProfileSettings', () => {
            it('should update user\'s settings', done => {
                const userId = 'USER_ID';

                server.respondWith(
                    '/gdc/account/profile/' + userId + '/settings',
                    [400, {'Content-Type': 'application/json'}, '']
                );
                user.updateProfileSettings(userId, []).then(function() {
                    expect().fail('Should reject with 400');
                    done();
                }, function(err) {
                    expect(err.status).to.be(400);
                    done();
                });
            });
        });

        describe('Account info', () => {
            it('should return info about account', done => {
                const login = 'LOGIN';
                const loginMD5 = 'LOGIN_MD5';
                const firstName = 'FIRST_NAME';
                const lastName = 'LAST_NAME';
                const organizationName = 'ORG_NAME';
                const profileUri = 'PROFILE_URI';

                server.respondWith(
                    'GET',
                    '/gdc/app/account/bootstrap',
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
