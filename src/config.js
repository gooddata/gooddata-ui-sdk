// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import { set as _set, get as _get } from 'lodash';

/**
 * Config module holds SDK configuration variables
 *
 * Currently its only custom domain - which enabled using
 * sdk from different domain (using CORS)
 *
 * Never set properties directly - always use setter methods
 *
 * @module config
 * @class config
 */

const URL_REGEXP = '(?:(https)://+|(www\\.)?)\\w[:;,\\.?\\[\\]\\w/~%&=+#-@!]*';

export function sanitizeDomain(domain) {
    if (domain === null) {
        return undefined;
    }

    const sanitizedDomain = domain || '';
    const link = sanitizedDomain.match(URL_REGEXP);
    if (!link) {
        throw new Error(`${domain} is not a valid url`);
    }

    // ensure https:// prefix and strip possible trailing /
    return `https://${link[0].replace(/^https?:\/\/|\/$/g, '')}`;
}


/**
 * Returns sanitized config
 *
 * @method sanitizeConfig
 * @return {object|undefiend} config with sanitized domain
 */
export function sanitizeConfig(config) {
    const sanitized = { ...config };
    if (config.domain) {
        sanitized.domain = sanitizeDomain(config.domain);
    }
    return sanitized;
}

/**
 * Config factory
 *
 * @param {object|null} configStorage config object
 * @method createModule
 * @return SDK config module
 */
export function createModule(configStorage) {
    if (arguments.length !== 1) {
        throw new Error('Config module has to be called with exactly one argument.');
    }

    /**
     * Sets custom domain. Parameter is url which has always to be https://
     * (if you don't provide it, we will do it for you).
     *
     * RegExp inspired taken from
     * https://github.com/jarib/google-closure-library/blob/master/closure/goog/string/linkify.js
     * @param {String|null} domain valid domain starting with https:// or null for removing
     * @method setCustomDomain
     */
    function setCustomDomain(domain) {
        configStorage.domain = sanitizeDomain(domain); // eslint-disable-line no-param-reassign
    }

    /**
     * Returns current domain
     *
     * @method getCustomDomain
     */
    function getCustomDomain() {
        return configStorage.domain;
    }

    /**
     * Sets JS package and version info
     *
     * @method setJsPackage
     * @param {String} name package name
     * @param {String} version package version (semver)
     * @private
     */
    function setJsPackage(name, version) {
        if (!configStorage.originPackage) { // only set the first (topmost) package
            configStorage.originPackage = { name, version }; // eslint-disable-line no-param-reassign
        }
    }

    /**
     * Returns JS package and version info
     *
     * @method getJsPackage
     * @return {object} with 'name' and 'version' properties
     * @private
     */
    function getJsPackage() {
        return configStorage.originPackage;
    }

    function setRequestHeader(key, value) {
        _set(configStorage, ['xhrSettings', 'headers', key], value);
    }

    function getRequestHeader(key) {
        return _get(configStorage, ['xhrSettings', 'headers', key]);
    }

    return {
        setCustomDomain,
        getCustomDomain,
        setJsPackage,
        getJsPackage,
        setRequestHeader,
        getRequestHeader
    };
}
