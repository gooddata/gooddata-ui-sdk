// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.

import { get } from 'lodash';

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
