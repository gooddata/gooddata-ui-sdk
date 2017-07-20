// Copyright (C) 2007-2017, GoodData(R) Corporation. All rights reserved.

import { get } from 'lodash';
import { get as xhrGet } from './xhr';
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
export const handlePolling = (uri, isPollingDone, options = {}) => {
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
                return handlePolling(uri, isPollingDone, {
                    ...options,
                    attempts: attempts + 1
                });
            });
    });
};
