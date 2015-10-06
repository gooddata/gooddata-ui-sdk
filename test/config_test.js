// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
/* eslint func-names: 0 */
import * as config from '../src/config';

describe('config', () => {
    describe('setCustomDomain', () => {
        afterEach(function() {
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
            expect(function() {
                config.setCustomDomain('$');
            }).to.throwError();
        });
    });
});


