// Copyright (C) 2007-2017, GoodData(R) Corporation. All rights reserved.

import { get } from 'lodash';
import { delay } from './utils/promise';

/**
 * Utility methods. Mostly private
 *
 * @module util
 * @class util
 *
 */

/**
 * Create getter function for accessing nested objects
 *
 * @param {String} path Target path to nested object
 * @method getIn
 * @private
 */
export const getIn = path => object => get(object, path);

/**
 * Helper for polling
 *
 * @param {String} uri
 * @param {Function} isPollingDone
 * @param {Object} options for polling (maxAttempts, pollStep)
 * @private
 */
export const handlePolling = (xhrGet, uri, isPollingDone, options = {}) => {
    const {
        attempts = 0,
        maxAttempts = 50,
        pollStep = 5000
    } = options;

    return xhrGet(uri).then((response) => {
        if (attempts > maxAttempts) {
            return Promise.reject(new Error(response));
        }
        return isPollingDone(response) ?
            Promise.resolve(response) :
            delay(pollStep).then(() => {
                return handlePolling(xhrGet, uri, isPollingDone, {
                    ...options,
                    attempts: attempts + 1
                });
            });
    });
};


/**
 * Builds query string from plain object
 * (Refactored from admin/routes.js)
 *
 * @param {Object} query parameters possibly including arrays inside
 * @returns {string} querystring
 */
export function queryString(query) {
    function getSingleParam(key, value) {
        return (Array.isArray(value) ?
            value.map(item => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`).join('&') :
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }

    return query ? `?${Object.keys(query).map(k => getSingleParam(k, query[k])).join('&')}` : '';
}
