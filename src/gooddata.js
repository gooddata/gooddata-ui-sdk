// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import * as xhr from './xhr';
import * as user from './user';
import * as md from './metadata';
import * as execution from './execution';
import * as project from './project';
import * as config from './config';
import * as catalogue from './catalogue';
import admin from './admin';

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
const gooddata = { config, xhr, user, md, execution, project, catalogue, admin };
export default gooddata;
module.exports = gooddata;

