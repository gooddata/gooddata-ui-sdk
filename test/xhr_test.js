// Copyright (C) 2007-2013, GoodData(R) Corporation. All rights reserved.
import * as testMock from '../src/utils/testMock';

import * as xhr from '../src/xhr';
import { setCustomDomain } from '../src/config';

describe('fetch', () => {
    afterEach(() => {
        testMock.restore();
    });

    describe('xhr.ajax request', () => {
        it('should handle successful request', () => {
            testMock.mock('/some/url', { status: 200, body: 'hello' });
            return xhr.ajax('/some/url').then((response) => {
                expect(response.status).to.be(200);
                return response.text();
            }).then((body) => {
                expect(body).to.be('hello');
            });
        });

        it('should stringify JSON data for GDC backend', () => {
            testMock.mock('/some/url', { status: 200 });
            const mockBody = { foo: 'bar' };
            xhr.ajax('/some/url', {
                body: mockBody // TODO for jQuery compat this should be "data"
            });
            expect(testMock.getMock().calls().matched[0][1].body).to.be('{"foo":"bar"}');
        });

        it('should handle unsuccessful request', () => {
            testMock.mock('/some/url', 404);
            return xhr.ajax('/some/url').then(() => {
                expect().fail('should be rejected');
            }, (err) => {
                expect(err.response.status).to.be(404);
            });
        });

        it('should have accept header set on application/json', () => {
            testMock.mock('/some/url', 200);
            xhr.ajax('/some/url');
            expect(testMock.getMock().calls().matched[0][1].headers.Accept).to.be('application/json; charset=utf-8');
        });
    });

    describe('xhr.ajax unauthorized handling', () => {
        it('should renew token when TT expires', () => {
            testMock.mock('/some/url', (url) => {
                // for the first time return 401 - simulate no token
                if (testMock.getMock().calls(url).length === 1) {
                    return 401;
                }

                return 200;
            })
            .mock('/gdc/account/token', 200);
            return xhr.ajax('/some/url').then((r) => {
                expect(r.status).to.be(200);
            });
        });

        it('should fail if token renewal fails', () => {
            testMock.mock('/some/url', 401)
                     .mock('/gdc/account/token', 401);
            return xhr.ajax('/some/url').then(null, (err) => {
                expect(err.response.status).to.be(401);
            });
        });

        it('should correctly handle multiple requests with token request in progress', () => {
            const firstFailedMatcher = () => {
                if (testMock.getMock().calls('/some/url/1').length === 1) {
                    return 401;
                }

                return 200;
            };

            testMock.mock('/some/url/1', firstFailedMatcher)
                     .mock('/some/url/2', firstFailedMatcher)
                     .mock('/gdc/account/token', 200);

            return Promise.all([xhr.ajax('/some/url/1'), xhr.ajax('/some/url/2')]).then((r) => {
                expect(r[0].status).to.be(200);
                expect(r[1].status).to.be(200);
            });
        });
    });

    describe('xhr.ajax polling', () => {
        it('should retry request after delay', () => {
            testMock.mock('/some/url', (url) => {
                if (testMock.getMock().calls(url).length <= 2) {
                    return 202;
                }

                return { status: 200, body: 'Poll result' };
            });

            return xhr.ajax('/some/url', { pollDelay: 0 }).then((r) => {
                expect(r.status).to.be(200);
                expect(testMock.getMock().calls('/some/url').length).to.be(3);

                return r.text().then((t) => {
                    expect(t).to.be('Poll result');
                });
            });
        });

        it('should not poll if client forbids it', () => {
            testMock.mock('/some/url', (url) => {
                if (testMock.getMock().calls(url).length <= 2) {
                    return 202;
                }

                return { status: 200, body: 'poll result' };
            });

            return xhr.ajax('/some/url', { pollDelay: 0, dontPollOnResult: true }).then((r) => {
                expect(r.status).to.be(202);
                expect(testMock.getMock().calls('/some/url').length).to.be(1);
            });
        });

        it('should correctly reject after retry is 404', () => {
            testMock.mock('/some/url', (url) => {
                if (testMock.getMock().calls(url).length <= 2) {
                    return 202;
                }

                return 404;
            });

            return xhr.ajax('/some/url', { pollDelay: 0 }).then(null, (err) => {
                expect(err.response.status).to.be(404);
            });
        });
    });

    describe('xhr.ajax polling with different location', () => {
        it('should retry request after delay', () => {
            testMock.mock('/some/url', { status: 202, headers: { Location: '/other/url' } });
            testMock.mock('/other/url', (url) => {
                if (testMock.getMock().calls(url).length <= 2) {
                    return 202;
                }

                return { status: 200, body: 'Poll result from other url' };
            });

            return xhr.ajax('/some/url', { pollDelay: 0 }).then((r) => {
                expect(r.status).to.be(200);
                expect(testMock.getMock().calls('/some/url').length).to.be(1);
                expect(testMock.getMock().calls('/other/url').length).to.be(3);

                return r.text().then((t) => {
                    expect(t).to.be('Poll result from other url');
                });
            });
        });

        it('should folow multiple redirects', () => {
            testMock.mock('/some/url', { status: 202, headers: { Location: '/other/url' } });
            testMock.mock('/other/url', { status: 202, headers: { Location: '/last/url' } });
            testMock.mock('/last/url', { status: 200, body: 'Poll result with redirects' });

            return xhr.ajax('/some/url', { pollDelay: 0 }).then((r) => {
                expect(r.status).to.be(200);
                expect(testMock.getMock().calls('/some/url').length).to.be(1);
                expect(testMock.getMock().calls('/other/url').length).to.be(1);
                expect(testMock.getMock().calls('/last/url').length).to.be(1);

                return r.text().then((t) => {
                    expect(t).to.be('Poll result with redirects');
                });
            });
        });

        it('should correctly reject after retry 404', () => {
            testMock.mock('/some/url', { status: 202, headers: { Location: '/other/url' } });
            testMock.mock('/other/url', (url) => {
                if (testMock.getMock().calls(url).length <= 2) {
                    return 202;
                }

                return 404;
            });

            return xhr.ajax('/some/url', { pollDelay: 0 }).then(null, (err) => {
                expect(err.response.status).to.be(404);
                expect(testMock.getMock().calls('/some/url').length).to.be(1);
                expect(testMock.getMock().calls('/other/url').length).to.be(3);
            });
        });
    });

    describe('shortcut methods', () => {
        beforeEach(() => {
            testMock.mock('url', 200);
        });

        it('should call xhr.ajax with get method', () => {
            xhr.get('url', {
                contentType: 'text/csv'
            });

            const [url, settings] = testMock.getMock().lastCall('url');
            expect(url).to.be('url');
            expect(settings.method).to.be('GET');
            expect(settings.contentType).to.be('text/csv');
        });

        it('should call xhr.ajax with post method', () => {
            const data = { message: 'THIS IS SPARTA!' };

            xhr.post('url', {
                data,
                contentType: 'text/csv'
            });

            const [url, settings] = testMock.getMock().lastCall('url');
            expect(url).to.be('url');
            expect(settings.method).to.be('POST');
            expect(settings.contentType).to.be('text/csv');
            expect(settings.body).to.be(JSON.stringify(data));
        });
    });

    describe('enrichSettingWithCustomDomain', () => {
        after(() => {
            setCustomDomain(null);
        });
        it('should not touch settings if no domain set', () => {
            testMock.mock('/test1', 200);
            expect(setCustomDomain).withArgs(undefined).to.throwError();

            xhr.ajax('/test1');

            const [url, settings] = testMock.getMock().lastCall('/test1');
            expect(url).to.be('/test1');
            expect(settings.credentials).to.be('same-origin');
            expect(settings.mode).to.be('same-origin');
        });
        it('should add domain before url', () => {
            setCustomDomain('https://domain.tld');
            testMock.mock('https://domain.tld/test1', 200);

            xhr.ajax('https://domain.tld/test1');

            const [url, settings] = testMock.getMock().lastCall('https://domain.tld/test1');
            expect(url).to.be('https://domain.tld/test1');
            expect(settings.credentials).to.be('include');
            expect(settings.mode).to.be('cors');
        });
        it('should not double domain in settings url', () => {
            setCustomDomain('https://domain.tld');
            testMock.mock('https://domain.tld/test1', 200);

            xhr.ajax('https://domain.tld/test1');

            const [url, settings] = testMock.getMock().lastCall('https://domain.tld/test1');
            expect(url).to.be('https://domain.tld/test1');
            expect(settings.credentials).to.eql('include');
            expect(settings.mode).to.eql('cors');
        });
    });
});

