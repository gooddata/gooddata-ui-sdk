// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import { cloneDeep } from 'lodash';
import { createModule as xhrFactory } from './xhr';
import { createModule as userFactory } from './user';
import { createModule as metadataFactory } from './metadata';
import { createModule as executionFactory } from './execution';
import { createModule as projectFactory } from './project';
import { createModule as configFactory, sanitizeConfig } from './config';
import { createModule as catalogueFactory } from './catalogue';
import { createModule as adminFactory } from './admin';

import { createModule as loadAttributesMapFactory } from './utils/attributesMapLoader';
import { getAttributesDisplayForms } from './utils/visualizationObjectHelper';

/**
 * # JS SDK
 * Here is a set of functions that mostly are a thin wraper over the [GoodData API](https://developer.gooddata.com/api).
 * Before calling any of those functions, you need to authenticate with a valid GoodData
 * user credentials. After that, every subsequent call in the current session is authenticated.
 * You can find more about the GD authentication mechanism here.
 *
 * ## GD Authentication Mechansim
 * In this JS SDK library we provide you with a simple `login(username, passwd)` function
 * that does the magic for you.
 * To fully understand the authentication mechansim, please read
 * [Authentication via API article](http://developer.gooddata.com/article/authentication-via-api)
 * on [GoodData Developer Portal](http://developer.gooddata.com/)
 *
 * @module sdk
 * @class sdk
 */
class SDK {
    constructor(config = {}) {
        this.configStorage = sanitizeConfig(config); // must be plain object, SDK modules MUST use this storage

        this.config = configFactory(this.configStorage);
        this.xhr = xhrFactory(this.configStorage);
        this.user = userFactory(this.xhr);
        this.md = metadataFactory(this.xhr);
        this.execution = executionFactory(this.xhr, this.md);
        this.project = projectFactory(this.xhr);
        this.catalogue = catalogueFactory(this.xhr, this.execution);
        this.admin = adminFactory(this.xhr);
        this.utils = {
            loadAttributesMap: loadAttributesMapFactory(this.md),
            getAttributesDisplayForms
        };
    }

    clone() {
        return new SDK(cloneDeep(this.configStorage));
    }
}

/**
 * # Factory for creating SDK instances
 *
 * @param {object|null} config object to be passed to SDK constructor
 * @method setCustomDomain
 */
export function factory(config = {}) {
    return new SDK(config);
}

const defaultInstance = factory();

export default defaultInstance;
