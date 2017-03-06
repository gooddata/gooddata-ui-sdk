// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
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

import { isNode } from './util';

const URL_REGEXP = '(?:(https)://+|(www\\.)?)\\w[:;,\\.?\\[\\]\\w/~%&=+#-@!]*';

// TODO - fix this
export let domain; // eslint-disable-line import/no-mutable-exports

/**
 * Sets custom domain. Parameter is url which has always to be https://
 * (if you don't provide it, we will do it for you).
 *
 * RegExp inspired taken from
 * https://github.com/jarib/google-closure-library/blob/master/closure/goog/string/linkify.js
 * @param {String|null} d valid domain starting with https:// or null for removing
 * @method setCustomDomain
 */
export function setCustomDomain(d) {
    const sanitizedDomain = d || '';
    const link = sanitizedDomain.match(URL_REGEXP);

    if (d === null) {
        domain = undefined;
        return;
    }

    if (!link) {
        throw new Error(`${d} is not a valid url`);
    }

    // ensure https:// prefix
    // and strip possible trailing /
    domain = `https://${link[0]
             .replace(/^https:\/\//, '')
             .replace(/\/$/, '')}`;
}

// decide if running in nodejs and use appropriate fetch function
let fetch;
if (isNode()) {
    fetch = require('fetch-cookie')(require('node-fetch'));
} else {
    fetch = require('isomorphic-fetch');
}

/**
 * Get fetch function
 * @return {function} fetch function
 */
export function getFetch() {
    return fetch;
}

/**
 * Set custom fetch function. Primarily used in tests to allow using fetchMock
 * @param {function} f fetch function
 */
export function setFetch(f) {
    fetch = f;
}
