// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import * as config from '../src/config';

describe('config', () => {
    describe('setCustomDomain', () => {
        afterEach(() => {
            config.domain = undefined;
        });
        it('should set url if valid', () => {
            config.setCustomDomain('https://custom.domain.tld/');
            expect(config.domain).toBe('https://custom.domain.tld');

            config.setCustomDomain('custom.domain.tld');
            expect(config.domain).toBe('https://custom.domain.tld');

            config.setCustomDomain('www.domain.tld');
            expect(config.domain).toBe('https://www.domain.tld');
        });
        it('should strip trailing uri', () => {
            config.setCustomDomain('https://custom.domain.tld/');
            expect(config.domain).toBe('https://custom.domain.tld');
        });
        it('should strip trailing whitespace', () => {
            config.setCustomDomain('   https://custom.domain.tld/  \n');
            expect(config.domain).toBe('https://custom.domain.tld');
        });
        it('should throw with invalid url', () => {
            expect(() => {
                config.setCustomDomain('$');
            }).toThrow();
        });
        it('should unset domain with null argument', () => {
            config.setCustomDomain(null);
            expect(config.domain).toBe(undefined);
        });
        it('should unset domain only with null argument', () => {
            expect(() => {
                config.setCustomDomain(undefined);
            }).toThrow();
            expect(() => {
                config.setCustomDomain(0);
            }).toThrow();
            expect(() => {
                config.setCustomDomain(NaN);
            }).toThrow();
        });
    });
});

