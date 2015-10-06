// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
/**
 * Utility methods. Mostly private
 *
 * @module util
 * @class util
 *
 */

/**
 * Simple get path helper method
 *
 * @private
 * @method getPath
 * @param {Object} obj object to start getting path from
 * @param {String} path path identifier
 * @return object at given path
 */
export function getPath(obj, path) {
    const paths = path.split('.');
    let found = obj;
    let i;

    for (i = 0; i < paths.length; ++i) {
        if (found[paths[i]] !== undefined) {
            found = found[paths[i]];
        } else {
            return undefined;
        }
    }
    return found;
}

/**
 * Create getter function for accessing nested objects
 *
 * @param {String} path Target path to nested object
 * @method getIn
 * @private
 */
export function getIn(path) {
    return function getter(object) {
        return getPath(object, path);
    };
}

