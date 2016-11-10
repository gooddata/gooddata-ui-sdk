// Copyright (C) 2007-2013, GoodData(R) Corporation. All rights reserved.
import fetchMock from 'fetch-mock';

import * as xhr from '../src/xhr';
import { setCustomDomain } from '../src/config';

describe('fetch', () => {
    afterEach(() => {
        fetchMock.restore();
    });

    describe('xhr.ajax request', () => {
        it('should handle successful request', () => {
            fetchMock.mock('/some/url', { status: 200, body: 'hello'});
            return xhr.ajax('/some/url').then(response => {
                expect(response.status).to.be(200);
                return response.text();
            }).then(body => {
                expect(body).to.be('hello');
            });
        });

        it('should stringify JSON data for GDC backend', () => {
            fetchMock.mock('/some/url', { status: 200 });
            const mockBody = { foo: 'bar' };
            xhr.ajax('/some/url', {
                body: mockBody // TODO for jQuery compat this should be "data"
            });
            expect(fetchMock.calls().matched[0][1].body).to.be('{"foo":"bar"}');
        });

        it('should handle unsuccessful request', () => {
            fetchMock.mock('/some/url', 404);
            return xhr.ajax('/some/url').then(() => {
                expect().fail('should be rejected');
            }, err => {
                expect(err.response.status).to.be(404);
            });
        });

        it('should have accept header set on application/json', () => {
            fetchMock.mock('/some/url', 200);
            xhr.ajax('/some/url');
            expect(fetchMock.calls().matched[0][1].headers.get('accept')).to.be('application/json; charset=utf-8');
        });
    });

    describe('xhr.ajax unauthorized handling', () => {
        it('should renew token when TT expires', () => {
            fetchMock.mock('/some/url', (url) => {
                // for the first time return 401 - simulate no token
                if (fetchMock.calls(url).length === 1) {
                    return 401;
                }

                return 200;
            })
            .mock('/gdc/account/token', 200);
            return xhr.ajax('/some/url').then(r => {
                expect(r.status).to.be(200);
            });
        });

        it('should fail if token renewal fails', () => {
            fetchMock.mock('/some/url', 401)
                     .mock('/gdc/account/token', 401);
            return xhr.ajax('/some/url').then(null, err => {
                expect(err.response.status).to.be(401);
            });
        });

        it('should correctly handle multiple requests with token request in progress', () => {
            const firstFailedMatcher = () => {
                if (fetchMock.calls('/some/url/1').length === 1) {
                    return 401;
                }

                return 200;
            };

            fetchMock.mock('/some/url/1', firstFailedMatcher)
                     .mock('/some/url/2', firstFailedMatcher)
                     .mock('/gdc/account/token', 200);

            return Promise.all([xhr.ajax('/some/url/1'), xhr.ajax('/some/url/2')]).then(r => {
                expect(r[0].status).to.be(200);
                expect(r[1].status).to.be(200);
            });
        });
    });

    describe('xhr.ajax polling', () => {
        it('should retry request after delay', () => {
            fetchMock.mock('/some/url', (url) => {
                if (fetchMock.calls(url).length <= 2) {
                    return 202;
                }

                return { status: 200, body: 'Poll result' };
            });

            return xhr.ajax('/some/url', { pollDelay: 0 }).then(r => {
                expect(r.status).to.be(200);
                expect(fetchMock.calls('/some/url').length).to.be(3);

                return r.text().then(t => {
                    expect(t).to.be('Poll result');
                });
            });
        });

        it('should not poll if client forbids it', () => {
            fetchMock.mock('/some/url', (url) => {
                if (fetchMock.calls(url).length <= 2) {
                    return 202;
                }

                return { status: 200, body: 'poll result' };
            });

            return xhr.ajax('/some/url', { pollDelay: 0, dontPollOnResult: true }).then(r => {
                expect(r.status).to.be(202);
                expect(fetchMock.calls('/some/url').length).to.be(1);
            });
        });

        it('should correctly reject after retry is 404', () => {
            fetchMock.mock('/some/url', (url) => {
                if (fetchMock.calls(url).length <= 2) {
                    return 202;
                }

                return 404;
            });

            return xhr.ajax('/some/url', { pollDelay: 0 }).then(null, err => {
                expect(err.response.status).to.be(404);
            });
        });
    });

    describe('xhr.ajax polling with different location', () => {
        it('should retry request after delay', () => {
            fetchMock.mock('/some/url', { status: 202, headers: { 'Location': '/other/url' } });
            fetchMock.mock('/other/url', (url) => {
                if (fetchMock.calls(url).length <= 2) {
                    return 202;
                }

                return { status: 200, body: 'Poll result from other url' };
            });

            return xhr.ajax('/some/url', { pollDelay: 0 }).then(r => {
                expect(r.status).to.be(200);
                expect(fetchMock.calls('/some/url').length).to.be(1);
                expect(fetchMock.calls('/other/url').length).to.be(3);

                return r.text().then(t => {
                    expect(t).to.be('Poll result from other url');
                });
            });
        });

        it('should folow multiple redirects', () => {
            fetchMock.mock('/some/url', { status: 202, headers: { 'Location': '/other/url' } });
            fetchMock.mock('/other/url', { status: 202, headers: { 'Location': '/last/url' } });
            fetchMock.mock('/last/url', { status: 200, body: 'Poll result with redirects' });

            return xhr.ajax('/some/url', { pollDelay: 0 }).then(r => {
                expect(r.status).to.be(200);
                expect(fetchMock.calls('/some/url').length).to.be(1);
                expect(fetchMock.calls('/other/url').length).to.be(1);
                expect(fetchMock.calls('/last/url').length).to.be(1);

                return r.text().then(t => {
                    expect(t).to.be('Poll result with redirects');
                });
            });
        });

        it('should correctly reject after retry 404', () => {
            fetchMock.mock('/some/url', { status: 202, headers: { 'Location': '/other/url' } });
            fetchMock.mock('/other/url', (url) => {
                if (fetchMock.calls(url).length <= 2) {
                    return 202;
                }

                return 404;
            });

            return xhr.ajax('/some/url', { pollDelay: 0 }).then(null, err => {
                expect(err.response.status).to.be(404);
                expect(fetchMock.calls('/some/url').length).to.be(1);
                expect(fetchMock.calls('/other/url').length).to.be(3);
            });
        });
    });

    describe('shortcut methods', () => {
        beforeEach(() => {
            fetchMock.mock('url', 200);
        });

        it('should call xhr.ajax with get method', () => {
            xhr.get('url', {
                contentType: 'text/csv'
            });

            const [url, settings] = fetchMock.lastCall('url');
            expect(url).to.be('url');
            expect(settings.method).to.be('GET');
            expect(settings.contentType).to.be('text/csv');
        });

        it('should call xhr.ajax with post method', () => {
            const data = { message: 'THIS IS SPARTA!' };

            xhr.post('url', {
                data: data,
                contentType: 'text/csv'
            });

            const [url, settings] = fetchMock.lastCall('url');
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
            fetchMock.mock('/test1', 200);
            expect(setCustomDomain).withArgs(undefined).to.throwError();

            xhr.ajax('/test1');

            const [url, settings] = fetchMock.lastCall('/test1');
            expect(url).to.be('/test1');
            expect(settings.credentials).to.be('same-origin');
            expect(settings.mode).to.be('same-origin');
        });
        it('should add domain before url', () => {
            setCustomDomain('https://domain.tld');
            fetchMock.mock('https://domain.tld/test1', 200);

            xhr.ajax('https://domain.tld/test1');

            const [url, settings] = fetchMock.lastCall('https://domain.tld/test1');
            expect(url).to.be('https://domain.tld/test1');
            expect(settings.credentials).to.be('include');
            expect(settings.mode).to.be('cors');
        });
        it('should not double domain in settings url', () => {
            setCustomDomain('https://domain.tld');
            fetchMock.mock('https://domain.tld/test1', 200);

            xhr.ajax('https://domain.tld/test1');

            const [url, settings] = fetchMock.lastCall('https://domain.tld/test1');
            expect(url).to.be('https://domain.tld/test1');
            expect(settings.credentials).to.eql('include');
            expect(settings.mode).to.eql('cors');
        });
    });
});

