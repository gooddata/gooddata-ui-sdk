// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
define([
    './xhr',
    './util',
    './user',
    './metadata',
    './execution',
    './project',
    './config'
], function(
    xhr,
    util,
    user,
    metadata,
    execution,
    project,
    config
) {
    'use strict';

    /**
     * # JS SDK
     * Here is a set of functions that mostly are a thin wraper over the [GoodData API](https://developer.gooddata.com/api).
     * Before calling any of those functions, you need to authenticate with a valid GoodData
     * user credentials. After that, every subsequent call in the current session is authenticated.
     * You can find more about the GD authentication mechanism here.
     *
     * ## Conventions and Dependencies
     * * Depends on [jQuery JavaScript library](http://jquery.com/) javascript library
     * * Each SDK function returns [jQuery Deferred promise](http://api.jquery.com/deferred.promise/)
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
    return {
        config: config,
        xhr: xhr,
        user: user,
        md: metadata,
        execution: execution,
        project: project
    };
});

