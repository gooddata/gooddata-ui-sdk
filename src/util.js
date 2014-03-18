// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
define(function() {
    'use strict';

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
    var getPath = function(obj, path) {
        var paths = path.split('.'),
            found = obj,
            i;

        for (i = 0; i < paths.length; ++i) {
            if (found[paths[i]] === undefined) {
                return undefined;
            } else {
                found = found[paths[i]];
            }
        }
        return found;
    };

    /**
     * Create getter function for accessing nested objects
     *
     * @param {String} path Target path to nested object
     * @method getIn
     * @private
     */
    var getIn = function(path) {
        return function(object) {
            return getPath(object, path);
        };
    };

    return {
        getPath: getPath,
        getIn: getIn
    };
});

