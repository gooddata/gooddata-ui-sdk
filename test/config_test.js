// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
define(['config'], function(config) {
    'use strict';
    describe('config', function() {

        describe('setCustomDomain', function() {
            afterEach(function() {
                config.domain = undefined;
            });
            it('should set url if valid', function() {
                config.setCustomDomain('https://custom.domain.tld/');
                expect(config.domain).to.be('https://custom.domain.tld');

                config.setCustomDomain('custom.domain.tld');
                expect(config.domain).to.be('https://custom.domain.tld');

                config.setCustomDomain('www.domain.tld');
                expect(config.domain).to.be('https://www.domain.tld');
            });
            it('should strip trailing uri', function() {
                config.setCustomDomain('https://custom.domain.tld/');
                expect(config.domain).to.be('https://custom.domain.tld');
            });
            it('should strip trailing whitespace', function() {
                config.setCustomDomain("   https://custom.domain.tld/  \n");
                expect(config.domain).to.be('https://custom.domain.tld');
            });
            it('should throw with invalid url', function() {
                expect(function () {
                    config.setCustomDomain('$');
                }).to.throwError();
            });
        });
    });
});


