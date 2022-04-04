// (C) 2007-2022 GoodData Corporation
import { sanitizeConfig, sanitizeDomain, ConfigModule } from "../config";
import { IConfigStorage } from "../interfaces";

describe("sanitizeDomain", () => {
    it("should set url if valid", () => {
        expect(sanitizeDomain("https://custom.domain.tld/")).toBe("https://custom.domain.tld");
        expect(sanitizeDomain("custom.domain.tld")).toBe("https://custom.domain.tld");
        expect(sanitizeDomain("www.domain.tld")).toBe("https://www.domain.tld");
    });
    it("should strip trailing uri", () => {
        expect(sanitizeDomain("https://custom.domain.tld/")).toBe("https://custom.domain.tld");
    });
    it("should strip trailing whitespace", () => {
        expect(sanitizeDomain("   https://custom.domain.tld/  \n")).toBe("https://custom.domain.tld");
    });
    it("should throw with invalid url", () => {
        expect(() => {
            sanitizeDomain("$");
        }).toThrow();
    });
    it("should return undefined for null argument", () => {
        expect(sanitizeDomain(null)).toBe(undefined);
    });
});

describe("sanitizeConfig", () => {
    const dirtyDomain = "http://example.com/";
    const sanitizedDomain = "https://example.com";

    it("should sanitize domain", () => {
        expect(
            sanitizeConfig({
                domain: dirtyDomain,
            }),
        ).toEqual({
            domain: sanitizedDomain,
        });
    });
});

describe("config module", () => {
    describe("createModule", () => {
        it("should use configStorage", () => {
            const configStorage: IConfigStorage = {};
            const config = new ConfigModule(configStorage);
            config.setJsPackage("nm", "ver");
            expect(configStorage.originPackage).toEqual({ name: "nm", version: "ver" });
        });
    });

    describe("setCustomDomain, getDomain", () => {
        const configStorage: IConfigStorage = {};
        const config = new ConfigModule(configStorage);
        const domain = "https://example.com";

        config.setCustomDomain(domain);
        it("should set domain to configStorage", () => {
            expect(configStorage.domain).toBe(domain);
        });
        it("should return current domain", () => {
            expect(config.getCustomDomain()).toBe(domain);
        });
    });

    describe("setJsPackage, getJsPackage", () => {
        const configStorage: IConfigStorage = {};
        const config = new ConfigModule(configStorage);
        const name = "package";
        const version = "1.0.0";

        config.setJsPackage(name, version);
        it("should set package to configStorage", () => {
            expect(configStorage.originPackage).toEqual({ name, version });
        });
        it("should set and get package name and version", () => {
            expect(config.getJsPackage()).toEqual({ name, version });
        });
    });

    describe("setRequestHeader, getRequestHeader", () => {
        const configStorage = {};
        const config = new ConfigModule(configStorage);
        const key = "key";
        const value = "value";

        it("should set and get header key and value", () => {
            config.setRequestHeader(key, value);
            expect(config.getRequestHeader(key)).toBe(value);
        });
    });
});
