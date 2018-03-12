// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import { createModule, sanitizeConfig, sanitizeDomain } from '../src/config';

describe('sanitizeDomain', () => {
    it('should set url if valid', () => {
        expect(sanitizeDomain('https://custom.domain.tld/'))
            .toBe('https://custom.domain.tld');
        expect(sanitizeDomain('custom.domain.tld'))
            .toBe('https://custom.domain.tld');
        expect(sanitizeDomain('www.domain.tld'))
            .toBe('https://www.domain.tld');
    });
    it('should strip trailing uri', () => {
        expect(sanitizeDomain('https://custom.domain.tld/'))
            .toBe('https://custom.domain.tld');
    });
    it('should strip trailing whitespace', () => {
        expect(sanitizeDomain('   https://custom.domain.tld/  \n'))
            .toBe('https://custom.domain.tld');
    });
    it('should throw with invalid url', () => {
        expect(() => { sanitizeDomain('$'); }).toThrow();
    });
    it('should return undefined for null argument', () => {
        expect(sanitizeDomain(null)).toBe(undefined);
    });
    it('should return undefined only for null argument', () => {
        expect(() => { sanitizeDomain(undefined); }).toThrow();
        expect(() => { sanitizeDomain(0); }).toThrow();
        expect(() => { sanitizeDomain(NaN); }).toThrow();
    });
});

describe('sanitizeConfig', () => {
    const dirtyDomain = 'http://example.com/';
    const sanitizedDomain = 'https://example.com';

    it('should sanitize domain', () => {
        expect(sanitizeConfig({
            domain: dirtyDomain
        })).toEqual({
            domain: sanitizedDomain
        });
    });
});

describe('config module', () => {
    describe('createModule', () => {
        it('should throw without an argument', () => {
            expect(() => { createModule(); }).toThrow();
        });

        it('should use configStorage', () => {
            const configStorage = {};
            const config = createModule(configStorage);
            config.setJsPackage('nm', 'ver');
            expect(configStorage.originPackage).toEqual({ name: 'nm', version: 'ver' });
        });
    });

    describe('setCustomDomain, getDomain', () => {
        const configStorage = {};
        const config = createModule(configStorage);
        const domain = 'https://example.com';

        config.setCustomDomain(domain);
        it('should set domain to configStorage', () => {
            expect(configStorage.domain).toBe(domain);
        });
        it('should return current domain', () => {
            expect(config.getCustomDomain()).toBe(domain);
        });
    });

    describe('setJsPackage, getJsPackage', () => {
        const configStorage = {};
        const config = createModule(configStorage);
        const name = 'package';
        const version = '1.0.0';

        config.setJsPackage(name, version);
        it('should set package to configStorage', () => {
            expect(configStorage.originPackage).toEqual({ name, version });
        });
        it('should set and get package name and version', () => {
            expect(config.getJsPackage()).toEqual({ name, version });
        });
    });

    describe('setRequestHeader, getRequestHeader', () => {
        const configStorage = {};
        const config = createModule(configStorage);
        const key = 'key';
        const value = 'value';

        it('should set and get header key and value', () => {
            config.setRequestHeader(key, value);
            expect(config.getRequestHeader(key)).toBe(value);
        });
    });
});

