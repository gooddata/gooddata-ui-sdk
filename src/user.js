// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import $ from 'jquery';
import { ajax, get, post, put } from './xhr';

/**
 * @module user
 * @class user
 */

/**
 * Find out whether a user is logged in
 *
 * Returns a promise which either:
 * **resolves** - which means user is logged in or
 * **rejects** - meaning is not logged in
 * @method isLoggedIn
 */
export function isLoggedIn() {
    return $.getJSON('/gdc/account/token');
}


/**
 * This function provides an authentication entry point to the GD API. It is needed to authenticate
 * by calling this function prior any other API calls. After providing valid credentials
 * every subsequent API call in a current session will be authenticated.
 *
 * @method login
 * @param {String} username
 * @param {String} password
 */
export function login(username, password) {
    return post('/gdc/account/login', {
        data: JSON.stringify({
            postUserLogin: {
                login: username,
                password: password,
                remember: 1,
                captcha: '',
                verifyCaptcha: ''
            }
        })
    });
}

/**
 * Logs out current user
 * @method logout
 */
export function logout() {
    /* eslint new-cap: 0 */
    const d = $.Deferred();

    isLoggedIn().then(function resolve() {
        return get('/gdc/app/account/bootstrap').then(function resolveGet(result) {
            const userUri = result.bootstrapResource.accountSetting.links.self;
            const userId = userUri.match(/([^\/]+)\/?$/)[1];

            return userId;
        }, d.reject);
    }, d.resolve).then(function resolveAll(userId) {
        return ajax('/gdc/account/login/' + userId, {
            method: 'delete'
        });
    }).then(d.resolve, d.reject);

    return d.promise();
}

/**
 * Updates user's profile settings
 * @method updateProfileSettings
 * @param {String} profileId - User profile identifier
 * @param {Object} profileSetting
*/
export function updateProfileSettings(profileId, profileSetting) {
    /*eslint-disable new-cap*/
    const d = $.Deferred();
    /*eslint-enable new-cap*/

    put('/gdc/account/profile/' + profileId + '/settings', {
        data: profileSetting
    }).then(d.resolve, d.reject);

    return d.promise();
}

/**
 * Returns info about currently logged in user from bootstrap resource
 * @method getAccountInfo
 */
export function getAccountInfo() {
    /* eslint new-cap: 0 */
    const d = $.Deferred();

    get('/gdc/app/account/bootstrap').then(function resolveBootstrap(result) {
        const br = result.bootstrapResource;
        const accountInfo = {
            login: br.accountSetting.login,
            loginMD5: br.current.loginMD5,
            firstName: br.accountSetting.firstName,
            lastName: br.accountSetting.lastName,
            organizationName: br.settings.organizationName,
            profileUri: br.accountSetting.links.self
        };

        d.resolve(accountInfo);
    }, d.reject);

    return d.promise();
}
