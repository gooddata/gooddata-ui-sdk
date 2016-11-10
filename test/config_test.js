// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import * as config from '../src/config';

describe('config', () => {
    describe('setCustomDomain', () => {
        afterEach(() => {
            config.domain = undefined;
        });
        it('should set url if valid', () => {
            config.setCustomDomain('https://custom.domain.tld/');
            expect(config.domain).to.be('https://custom.domain.tld');

            config.setCustomDomain('custom.domain.tld');
            expect(config.domain).to.be('https://custom.domain.tld');

            config.setCustomDomain('www.domain.tld');
            expect(config.domain).to.be('https://www.domain.tld');
        });
        it('should strip trailing uri', () => {
            config.setCustomDomain('https://custom.domain.tld/');
            expect(config.domain).to.be('https://custom.domain.tld');
        });
        it('should strip trailing whitespace', () => {
            config.setCustomDomain(`   https://custom.domain.tld/  \n`);
            expect(config.domain).to.be('https://custom.domain.tld');
        });
        it('should throw with invalid url', () => {
            expect(() => {
                config.setCustomDomain('$');
            }).to.throwError();
        });
        it('should unset domain with null argument', () => {
            config.setCustomDomain(null);
            expect(config.domain).to.be(undefined);
        });
        it('should unset domain only with null argument', () => {
            expect(() => {
                config.setCustomDomain(undefined);
            }).to.throwError();
            expect(() => {
                config.setCustomDomain(0);
            }).to.throwError();
            expect(() => {
                config.setCustomDomain(NaN);
            }).to.throwError();
        });
    });
});


