// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import * as testMock from '../src/utils/testMock';
import * as user from '../src/user';

describe('user', () => {
    describe('with fake server', () => {
        afterEach(() => {
            testMock.restore();
        });

        describe('login', () => {
            it('resolves with userLogin using valid credential', () => {
                testMock.mock(
                    '/gdc/account/login',
                    'POST',
                    {
                        status: 200,
                        body: JSON.stringify(
                            { userLogin: { profile: '/gdc/account/profile/abcd', state: '/gdc/account/login/abcd' } }
                        )
                    }
                );

                return user.login('login', 'pass').then((result) => {
                    expect(result).to.eql(
                        { userLogin: { profile: '/gdc/account/profile/abcd', state: '/gdc/account/login/abcd' } }
                    );
                });
            });

            it('rejects with bad credentials', () => {
                testMock.mock(
                    '/gdc/account/login',
                    'POST',
                    400
                );

                return user.login('bad', 'creds').then(null, err => expect(err).to.be.an(Error));
            });
        });

        describe('isLoggedIn', () => {
            it('should resolve if user logged in', () => {
                testMock.mock(
                    '/gdc/account/token',
                    'GET',
                    200
                );
                return user.isLoggedIn().then(r => expect(r).to.be.ok());
            });

            it('should resolve with false if user not logged in', () => {
                testMock.mock(
                    '/gdc/account/token',
                    'GET',
                    401
                );
                return user.isLoggedIn().then((r) => {
                    expect(r).not.to.be.ok();
                });
            });
        });

        describe('logout', () => {
            it('should resolve when user is not logged in', () => {
                testMock.mock(
                    '/gdc/account/token',
                    'GET',
                    401
                );

                return user.logout().then(null, err => expect(err).fail('Should resolve'));
            });

            it('should log out user', () => {
                const userId = 'USER_ID';

                testMock.mock(
                    '/gdc/account/token',
                    'GET',
                    200
                );

                testMock.mock(
                    '/gdc/app/account/bootstrap',
                    'GET',
                    {
                        status: 200,
                        body: JSON.stringify({
                            bootstrapResource: {
                                accountSetting: {
                                    links: {
                                        self: `/gdc/account/profile/${userId}`
                                    }
                                }
                            }
                        })
                    }
                );

                testMock.mock(
                    `/gdc/account/login/${userId}`,
                    'DELETE',
                    200 // should be 204, but see https://github.com/wheresrhys/fetch-mock/issues/36
                );

                return user.logout().then(r => expect(r.ok).to.be.ok());
            });
        });

        describe('updateProfileSettings', () => {
            it('should update user\'s settings', () => {
                const userId = 'USER_ID';

                testMock.mock(
                    `/gdc/account/profile/${userId}/settings`,
                    { status: 400, body: '' }
                );
                return user.updateProfileSettings(userId, []).then(() => {
                    expect().fail('Should reject with 400');
                }, (err) => {
                    expect(err.response.status).to.be(400);
                });
            });
        });

        describe('Account info', () => {
            it('should return info about account', () => {
                const login = 'LOGIN';
                const loginMD5 = 'LOGIN_MD5';
                const firstName = 'FIRST_NAME';
                const lastName = 'LAST_NAME';
                const organizationName = 'ORG_NAME';
                const profileUri = 'PROFILE_URI';

                testMock.mock(
                    '/gdc/app/account/bootstrap',
                    'GET',
                    {
                        status: 200,
                        body: JSON.stringify({
                            bootstrapResource: {
                                accountSetting: {
                                    login,
                                    firstName,
                                    lastName,
                                    links: {
                                        self: profileUri
                                    }
                                },
                                current: {
                                    loginMD5
                                },
                                settings: {
                                    organizationName
                                }
                            }
                        })
                    }
                );

                return user.getAccountInfo().then((accountInfo) => {
                    expect(accountInfo.login).to.eql(login);
                    expect(accountInfo.loginMD5).to.eql(loginMD5);
                    expect(accountInfo.firstName).to.eql(firstName);
                    expect(accountInfo.lastName).to.eql(lastName);
                    expect(accountInfo.organizationName).to.eql(organizationName);
                    expect(accountInfo.profileUri).to.eql(profileUri);
                });
            });
        });
    });
});
