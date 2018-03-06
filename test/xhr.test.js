// Copyright (C) 2007-2013, GoodData(R) Corporation. All rights reserved.
import fetchMock from './utils/fetch-mock';

import { createModule as xhrFactory, handlePolling } from '../src/xhr';
import { createModule as configFactory } from '../src/config';

const config = configFactory();
const xhr = xhrFactory(config);

describe('fetch', () => {
    afterEach(() => {
        fetchMock.restore();
    });

    describe('xhr.ajax request', () => {
        it('should handle successful request', () => {
            fetchMock.mock('/some/url', { status: 200, body: 'hello' });
            return xhr.ajax('/some/url').then((response) => {
                expect(response.status).toBe(200);
                return response.text();
            }).then((body) => {
                expect(body).toBe('hello');
            });
        });

        it('should stringify JSON data for GDC backend', () => {
            fetchMock.mock('/some/url', { status: 200 });
            const mockBody = { foo: 'bar' };
            xhr.ajax('/some/url', {
                body: mockBody // TODO for jQuery compat this should be "data"
            });
            expect(fetchMock.calls().matched[0][1].body).toBe('{"foo":"bar"}');
        });

        it('should handle unsuccessful request', () => {
            fetchMock.mock('/some/url', 404);
            return xhr.ajax('/some/url').then(() => {
                throw new Error('should be rejected');
            }, (err) => {
                expect(err.response.status).toBe(404);
            });
        });

        it('should have accept header set on application/json', () => {
            fetchMock.mock('/some/url', 200);
            xhr.ajax('/some/url');
            expect(fetchMock.calls().matched[0][1].headers.Accept).toBe('application/json; charset=utf-8');
        });

        it('should set custom headers', () => {
            fetchMock.mock('/some/url', 200);
            xhr.ajax('/some/url', { headers: { 'X-GDC-REQUEST': 'foo' } });
            expect(fetchMock.calls().matched[0][1].headers.Accept).toBe('application/json; charset=utf-8');
            expect(fetchMock.calls().matched[0][1].headers['X-GDC-REQUEST']).toBe('foo');
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
            return xhr.ajax('/some/url').then((r) => {
                expect(r.status).toBe(200);
            });
        });

        it('should fail if token renewal fails', () => {
            fetchMock.mock('/some/url', 401)
                .mock('/gdc/account/token', 401);
            return xhr.ajax('/some/url').then(null, (err) => {
                expect(err.response.status).toBe(401);
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

            return Promise.all([xhr.ajax('/some/url/1'), xhr.ajax('/some/url/2')]).then((r) => {
                expect(r[0].status).toBe(200);
                expect(r[1].status).toBe(200);
            });
        });
    });

    describe('xhr.ajax polling', () => {
        afterEach(() => {
            jest.useRealTimers();
        });

        it('should allow for custom setting', () => {
            jest.useFakeTimers();

            const handleRequest = jest.fn(() => Promise.resolve());

            const promise = handlePolling('/some/url', { pollDelay: () => 1000 }, handleRequest);

            jest.runTimersToTime(1000); // ms

            expect(handleRequest).toHaveBeenCalledTimes(1);

            return promise;
        });

        it('should retry request after delay', () => {
            fetchMock.mock('/some/url', (url) => {
                if (fetchMock.calls(url).length <= 2) {
                    return 202;
                }

                return { status: 200, body: 'Poll result' };
            });

            return xhr.ajax('/some/url', { pollDelay: 0 }).then((r) => {
                expect(r.status).toBe(200);
                expect(fetchMock.calls('/some/url').length).toBe(3);

                return r.text().then((t) => {
                    expect(t).toBe('Poll result');
                });
            });
        });

        it('should poll on provided url', () => {
            fetchMock.mock('/some/url', () => {
                return {
                    status: 202,
                    __redirectUrl: '/some/url2'
                };
            });

            fetchMock.mock('/some/url2', () => {
                return { status: 200, body: 'Poll result' };
            });

            return xhr.ajax('/some/url', { pollDelay: 0 }).then((r) => {
                expect(r.status).toBe(200);
                expect(fetchMock.calls('/some/url').length).toBe(1);
                expect(fetchMock.calls('/some/url2').length).toBe(1);

                return r.text().then((t) => {
                    expect(t).toBe('Poll result');
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

            return xhr.ajax('/some/url', { pollDelay: 0, dontPollOnResult: true }).then((r) => {
                expect(r.status).toBe(202);
                expect(fetchMock.calls('/some/url').length).toBe(1);
            });
        });

        it('should correctly reject after retry is 404', () => {
            fetchMock.mock('/some/url', (url) => {
                if (fetchMock.calls(url).length <= 2) {
                    return 202;
                }

                return 404;
            });

            return xhr.ajax('/some/url', { pollDelay: 0 }).then(null, (err) => {
                expect(err.response.status).toBe(404);
            });
        });
    });

    describe('xhr.ajax polling with different location', () => {
        it('should retry request after delay', () => {
            fetchMock.mock('/some/url', { status: 202, headers: { Location: '/other/url' } });
            fetchMock.mock('/other/url', (url) => {
                if (fetchMock.calls(url).length <= 2) {
                    return 202;
                }

                return { status: 200, body: 'Poll result from other url' };
            });

            return xhr.ajax('/some/url', { pollDelay: 0 }).then((r) => {
                expect(r.status).toBe(200);
                expect(fetchMock.calls('/some/url').length).toBe(1);
                expect(fetchMock.calls('/other/url').length).toBe(3);

                return r.text().then((t) => {
                    expect(t).toBe('Poll result from other url');
                });
            });
        });

        it('should folow multiple redirects', () => {
            fetchMock.mock('/some/url', { status: 202, headers: { Location: '/other/url' } });
            fetchMock.mock('/other/url', { status: 202, headers: { Location: '/last/url' } });
            fetchMock.mock('/last/url', { status: 200, body: 'Poll result with redirects' });

            return xhr.ajax('/some/url', { pollDelay: 0 }).then((r) => {
                expect(r.status).toBe(200);
                expect(fetchMock.calls('/some/url').length).toBe(1);
                expect(fetchMock.calls('/other/url').length).toBe(1);
                expect(fetchMock.calls('/last/url').length).toBe(1);

                return r.text().then((t) => {
                    expect(t).toBe('Poll result with redirects');
                });
            });
        });

        it('should correctly reject after retry 404', () => {
            fetchMock.mock('/some/url', { status: 202, headers: { Location: '/other/url' } });
            fetchMock.mock('/other/url', (url) => {
                if (fetchMock.calls(url).length <= 2) {
                    return 202;
                }

                return 404;
            });

            return xhr.ajax('/some/url', { pollDelay: 0 }).then(null, (err) => {
                expect(err.response.status).toBe(404);
                expect(fetchMock.calls('/some/url').length).toBe(1);
                expect(fetchMock.calls('/other/url').length).toBe(3);
            });
        });
    });

    describe('shortcut methods', () => {
        const data = { message: 'THIS IS SPARTA!' };

        beforeEach(() => {
            fetchMock.mock('url', { status: 200, body: data });
        });

        it('should call xhr.ajax with get method', () => {
            return xhr.get('url', {
                contentType: 'text/csv'
            }).then(() => {
                const [url, settings] = fetchMock.lastCall('url');
                expect(url).toBe('url');
                expect(settings.method).toBe('GET');
                expect(settings.contentType).toBe('text/csv');
            });
        });

        it('should call xhr.ajax with post method', () => {
            return xhr.post('url', {
                data,
                contentType: 'text/csv'
            }).then(() => {
                const [url, settings] = fetchMock.lastCall('url');
                expect(url).toBe('url');
                expect(settings.method).toBe('POST');
                expect(settings.contentType).toBe('text/csv');
                expect(settings.body).toBe(JSON.stringify(data));
            });
        });
    });

    describe('enrichSettingWithCustomDomain', () => {
        afterEach(() => {
            config.setCustomDomain(null);
        });

        it('should not touch settings if no domain set', () => {
            fetchMock.mock('/test1', 200);
            expect(() => config.setCustomDomain()).toThrow();

            xhr.ajax('/test1');

            const [url, settings] = fetchMock.lastCall('/test1');
            expect(url).toBe('/test1');
            expect(settings.credentials).toBe('same-origin');
            expect(settings.mode).toBe('same-origin');
        });

        it('should add domain before url', () => {
            config.setCustomDomain('https://domain.tld');
            fetchMock.mock('https://domain.tld/test1', 200);

            xhr.ajax('https://domain.tld/test1');

            const [url, settings] = fetchMock.lastCall('https://domain.tld/test1');
            expect(url).toBe('https://domain.tld/test1');
            expect(settings.credentials).toBe('include');
            expect(settings.mode).toBe('cors');
        });

        it('should not double domain in settings url', () => {
            config.setCustomDomain('https://domain.tld');
            fetchMock.mock('https://domain.tld/test1', 200);

            xhr.ajax('https://domain.tld/test1');

            const [url, settings] = fetchMock.lastCall('https://domain.tld/test1');
            expect(url).toBe('https://domain.tld/test1');
            expect(settings.credentials).toEqual('include');
            expect(settings.mode).toEqual('cors');
        });
    });

    describe('beforeSend', () => {
        it('should call beforeSend with settings and url', () => {
            const url = '/some/url';

            fetchMock.mock(url, { status: 200 });
            const beforeSendStub = jest.fn();
            xhr.ajaxSetup({
                beforeSend: beforeSendStub
            });

            xhr.ajax(url);
            expect(beforeSendStub.mock.calls[0][1]).toEqual(url);
        });
    });
});

