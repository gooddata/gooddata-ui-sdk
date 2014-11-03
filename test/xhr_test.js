// Copyright (C) 2007-2013, GoodData(R) Corporation. All rights reserved.
define(['gooddata', 'jquery'], function(gd, $) {
    describe("xhr", function() {
        before(function() {
            xhr = gd.xhr;
        });
        /* $.ajax returns jqXhr object with deferred interface
            this add jqXhr properties according to options to simulate jqXhr
        */
        function fakeJqXhr(options, d) {
            for (var i = 0; i < d.length; i++) {
                $.extend(d[i], options);
            }
        }

        var d = [], expects = [];

        beforeEach(function() {
            var mock = sinon.mock($);
            /** mock result for first three calls of $.ajax */
            for (var i = 0; i < 3; i++) {
                d.push($.Deferred());
                expects.push(mock.expects('ajax').returns(d[i]));
            }
        });

        afterEach(function() {
            d = [];
            expects = [];
            if ($.ajax.restore) $.ajax.restore();
        });

        function mockResponse(status, headers) {
            return {
                status: status,
                getResponseHeader: function(header) {
                    return headers ? headers[header] : null;
                }
            };
        }

        describe('$.ajax request', function() {
            it('should handle successful request', function(done) {
                xhr.ajax('/some/url').done(function(data, textStatus, xhr) {
                    expect(expects[0].calledOnce).to.be.ok();
                    expect(data).to.be('Hello');
                    expect(xhr.status).to.be(200);
                    done();
                });
                var settings = expects[0].lastCall.args[0];
                expect(settings.url).to.be('/some/url');
                expect(settings.contentType).to.be('application/json');
                d[0].resolve('Hello', '', mockResponse(200));
            });

            it('should stringify JSON data for GDC backend', function(done) {
                xhr.ajax('/some/url', {
                    type: 'post',
                    data: { foo: 'bar'}
                }).done(function(data, textStatus, xhr) {
                    done();
                });
                var settings = expects[0].lastCall.args[0];
                expect(settings.data).to.be('{"foo":"bar"}');
                d[0].resolve('Ok', '', mockResponse(200));
            });

            it('should handle unsuccessful request', function(done) {
                xhr.ajax('/some/url').fail(function(xhr) {
                    expect(expects[0].calledOnce).to.be.ok();
                    expect(xhr.status).to.be(404);
                    done();
                });
                d[0].reject(mockResponse(404));
            });

            it('should support url in settings', function(done) {
                xhr.ajax({ url: '/some/url'}).done(function(data, textStatus, xhr) {
                    expect(expects[0].calledOnce).to.be.ok();
                    expect(xhr.status).to.be(200);
                    done();
                });
                var settings = expects[0].lastCall.args[0];
                expect(settings.url).to.be('/some/url');
                d[0].resolve('Hello', '', mockResponse(200));
            });

            it('should work with sucess callback in settings', function(done) {
                xhr.ajax({ url: '/some/url', success: function(data, textStatus, xhr) {
                    expect(data).to.be('Hello');
                    expect(xhr.status).to.be(200);
                    done();
                }});
                d[0].resolve('Hello', '', mockResponse(200));
            });

            it('should work with error callback in settings', function(done) {
                xhr.ajax({ url: '/some/url', error: function(xhr, textStatus, err) {
                    expect(xhr.status, 404);
                    done();
                }});
                d[0].reject(mockResponse(404));
            });

            it('should work with complete callback in settings for success', function(done) {
                xhr.ajax({ url: '/some/url', complete: function() {
                    done();
                }});
                d[0].resolve('Hello', '', { status: 200});
            });

            it('should work with complete callback in settings for failure', function(done) {
                xhr.ajax({ url: '/some/url', complete: function() {
                    done();
                }});
                d[0].reject(mockResponse(404));
            });

            it('should have accept header set on application/json', function() {
                xhr.ajax({ url: '/some/url'}).done(function(data, textStatus, xhr) {
                    expect(expects[0].calledOnce).to.be.ok();
                    expect(xhr.status).to.be(200);
                    done();
                });
                var settings = expects[0].lastCall.args[0];
                expect(settings.headers.Accept).to.be("application/json; charset=utf-8");
            });
        });

        describe('$.ajax unathorized handling', function() {
            it('should renew token when TT expires', function(done) {
                var options = { url: '/some/url'};
                xhr.ajax(options).done(function(data, textStatus, xhr) {
                    expect(expects[2].calledOnce).to.be.ok();
                    expect(xhr.status).to.be(200);
                    expect(data).to.be('Hello');
                    done();
                });
                fakeJqXhr(options, d);
                d[0].reject(mockResponse(401)); //first request
                d[1].resolve({}, '', mockResponse(200)); //token request
                d[2].resolve('Hello', '', mockResponse(200)); //request retry
            });

            it('should fail if token renewal fails and unathorize handler is not set', function(done) {
                var options = { url: '/some/url'};
                xhr.ajax(options).fail(function(xhr) {
                    expect(xhr.status).to.be(401);
                    expect(expects[1].calledOnce).to.be.ok();
                    expect(expects[2].notCalled).to.be.ok();
                    done();
                });
                fakeJqXhr(options, d);
                d[0].reject(mockResponse(401)); //first request
                d[1].reject(mockResponse(401)); //token request
            });

            it('should invole unathorized handler is token request fail', function(done) {
                var options = {
                    url: '/some/url',
                    unauthorized: function(xhr) {
                        expect(xhr.status).to.be(401);
                        expect(expects[1].calledOnce).to.be.ok();
                        expect(expects[2].notCalled).to.be.ok();
                        done();
                    }
                };
                fakeJqXhr(options, d);
                xhr.ajax(options);
                d[0].reject(mockResponse(401)); //first request
                d[1].reject(mockResponse(401)); //token request
            });

            it('should correctly handle multiple requests with token request in progress', function(done) {
                var optionsFirst = {
                    url: '/some/url/1'
                };
                var optionsSecond = {
                    url: '/some/url/2'
                };

                $.extend(d[0], optionsFirst);
                $.extend(d[1], optionsSecond);

                xhr.ajax(optionsFirst);
                d[0].reject(mockResponse(401));

                // now, token request should be in progress
                // so this "failure" should continue after
                // token request and should correctly fail
                xhr.ajax(optionsSecond).fail(function(xhr) {
                    expect(xhr.status).to.be(403);
                    done();
                });

                // simulate token request failed
                d[1].reject(mockResponse(403));
            });
        });

        describe('$.ajax polling', function() {
            it('should retry request after delay', function(done) {
                var options = {
                    url: '/some/url',
                    pollDelay: 0
                };
                fakeJqXhr(options, d);
                xhr.ajax(options).done(function(data) {
                    expect(data).to.be('OK');
                    done();
                });
                d[0].resolve(null, '', mockResponse(202));
                d[1].resolve(null, '', mockResponse(202));
                d[2].resolve('OK', '', mockResponse(200));
            });

            it('should correctly reject after retry 404', function(done) {
                var options = {
                    url: '/some/url',
                    pollDelay: 0
                };
                fakeJqXhr(options, d);
                xhr.ajax(options).fail(function(xhr) {
                    expect(xhr.status).to.be(404);
                    done();
                });
                d[0].resolve(null, '', mockResponse(202));
                d[1].resolve(null, '', mockResponse(202));
                d[2].reject(mockResponse(404));
            });

        });

        describe('$.ajax polling with different location', function() {
            it('should retry request after delay', function(done) {
                var options = {
                    url: '/some/url',
                    pollDelay: 0
                };
                fakeJqXhr(options, d);
                xhr.ajax(options).done(function(data) {
                    expect(data).to.be('OK');
                    expect(expects[2].lastCall.args[0].url).to.be('/other/url');

                    done();
                });
                d[0].resolve(null, '', mockResponse(202, {'Location': '/other/url'}));
                d[1].resolve(null, '', mockResponse(202, {'Location': '/other/url'}));
                d[2].resolve('OK', '', mockResponse(200));
            });

            it('should folow multiple redirects', function(done) {
                var options = {
                    url: '/some/url',
                    pollDelay: 0
                };
                fakeJqXhr(options, d);
                xhr.ajax(options).done(function(data) {
                    expect(data).to.be('OK');
                    expect(expects[2].lastCall.args[0].url).to.be('/other/url2');

                    done();
                });
                d[0].resolve(null, '', mockResponse(202, {'Location': '/other/url'}));
                d[1].resolve(null, '', mockResponse(202, {'Location': '/other/url2'}));
                d[2].resolve('OK', '', mockResponse(200));
            });

            it('should correctly reject after retry 404', function(done) {
                var options = {
                    url: '/some/url',
                    pollDelay: 0
                };
                fakeJqXhr(options, d);
                xhr.ajax(options).fail(function(xhr) {
                    expect(xhr.status).to.be(404);
                    done();
                });
                d[0].resolve(null, '', mockResponse(202, {'Location': '/other/url'}));
                d[1].resolve(null, '', mockResponse(202, {'Location': '/other/url'}));
                d[2].reject(mockResponse(404));
            });

        });

        describe('shortcut methods', function() {
            before(function() {
                sinon.stub(xhr, 'ajax');
            });

            after(function() {
                xhr.ajax.restore();
            });

            beforeEach(function() {
                xhr.ajax.reset();
            });

            it('should call xhr.ajax with get method', function() {
                xhr.get('url', {
                    contentType: 'text/csv'
                });

                expect(xhr.ajax.getCall(0).args).to.be.eql(['url', {
                    method: 'GET',
                    contentType: 'text/csv'
                }]);
            });

            it('should call xhr.ajax with post method', function() {
                var data = { message: 'THIS IS SPARTA!' };

                xhr.post('url', {
                    data: data,
                    contentType: 'text/csv'
                });

                expect(xhr.ajax.getCall(0).args).to.be.eql(['url', {
                    method: 'POST',
                    data: data,
                    contentType: 'text/csv'
                }]);
            });
        });

        describe('enrichSettingWithCustomDomain', function() {
            it('should not touch settings if no domain set', function() {
                var settings = { url: '/test1' },
                    res = xhr.enrichSettingWithCustomDomain(settings, undefined);
                expect(res.url).to.be('/test1');
                expect(res.xhrFields).to.be(undefined);
            });
            it('should add domain before url', function() {
                var settings = { url: '/test1' },
                    res = xhr.enrichSettingWithCustomDomain(settings, 'https://domain.tld');
                expect(res.url).to.be('https://domain.tld/test1');
                expect(res.xhrFields).to.eql({ withCredentials: true });
            });
            it('should not double domain in settings url', function() {
                var settings = { url: 'https://domain.tld/test1' },
                    res = xhr.enrichSettingWithCustomDomain(settings, 'https://domain.tld');
                expect(res.url).to.be('https://domain.tld/test1');
                expect(res.xhrFields).to.eql({ withCredentials: true });
            });
        });
    });
});
