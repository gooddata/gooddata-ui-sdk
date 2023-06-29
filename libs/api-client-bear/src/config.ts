// (C) 2007-2020 GoodData Corporation
import set from "lodash/set.js";

/**
 * Config module holds SDK configuration variables
 *
 * Currently its only custom domain - which enabled using
 * sdk from different domain (using CORS)
 *
 * Never set properties directly - always use setter methods
 *
 */

const URL_REGEXP = "(?:(https)://+|(www\\.)?)\\w[:;,\\.?\\[\\]\\w/~%&=+#-@!]*";

export function sanitizeDomain(domain: string | null): string | undefined {
    if (domain === null) {
        return undefined;
    }

    const sanitizedDomain = domain || "";
    const link = sanitizedDomain.match(URL_REGEXP);
    if (!link) {
        throw new Error(`${domain} is not a valid url`);
    }

    // ensure https:// prefix and strip possible trailing /
    return `https://${link[0].replace(/^https?:\/\/|\/$/g, "")}`;
}

/**
 * Returns sanitized config
 *
 * @returns config with sanitized domain
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function sanitizeConfig(config: any): any {
    const sanitized = { ...config };
    if (config.domain) {
        sanitized.domain = sanitizeDomain(config.domain);
    }
    return sanitized;
}

export interface IOriginPackage {
    name: string;
    version: string;
}

export interface IConfigStorage {
    domain?: string;
    originPackage?: IOriginPackage;
    xhrSettings?: { headers?: Record<string, string> };
}

/**
 * Config factory
 *
 * @param configStorage - config object
 * @returns SDK config module
 */
export class ConfigModule {
    constructor(private configStorage: IConfigStorage) {
        if (arguments.length !== 1) {
            throw new Error("Config module has to be called with exactly one argument.");
        }
    }

    /**
     * Sets custom domain. Parameter is url which has always to be https://
     * (if you don't provide it, we will do it for you).
     *
     * RegExp inspired taken from
     * https://github.com/jarib/google-closure-library/blob/master/closure/goog/string/linkify.js
     * @param domain - valid domain starting with https:// or null for removing
     */
    public setCustomDomain(domain: string): void {
        this.configStorage.domain = sanitizeDomain(domain);
    }

    /**
     * Returns current domain
     *
     */
    public getCustomDomain(): string | undefined {
        return this.configStorage.domain;
    }

    /**
     * Sets JS package and version info
     *
     * @param name - package name
     * @param version - package version (semver)
     * @internal
     */
    public setJsPackage(name: string, version: string): void {
        if (!this.configStorage.originPackage) {
            // only set the first (topmost) package
            this.configStorage.originPackage = { name, version };
        }
    }

    /**
     * Returns JS package and version info
     *
     * @returns with 'name' and 'version' properties
     * @internal
     */
    public getJsPackage(): IOriginPackage | undefined {
        return this.configStorage.originPackage;
    }

    public setRequestHeader(key: string, value: string): void {
        set(this.configStorage, ["xhrSettings", "headers", key], value);
    }

    public getRequestHeader(key: string): string | undefined {
        return this.configStorage?.xhrSettings?.headers?.[key];
    }
}
