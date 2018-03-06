// Copyright (C) 2007-2017, GoodData(R) Corporation. All rights reserved.
import { ajax, get, post, put, parseJSON } from './xhr';

/**
 * @module user
 * @class user
 */

/**
 * Find out whether a user is logged in
 *
 * @return {Promise} resolves with true if user logged in, false otherwise
 * @method isLoggedIn
 */
export function isLoggedIn() {
    return new Promise((resolve, reject) => {
        // cannot use get here directly - we need to access to response
        // not to responses JSON get returns
        ajax('/gdc/account/token', { method: 'GET' }).then((r) => {
            if (r.ok) {
                resolve(true);
            }

            resolve(false);
        }, (err) => {
            if (err.response.status === 401) {
                resolve(false);
            } else {
                reject(err);
            }
        });
    });
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
        body: JSON.stringify({
            postUserLogin: {
                login: username,
                password,
                remember: 1,
                captcha: '',
                verifyCaptcha: ''
            }
        })
    }).then(parseJSON);
}

/**
 * This function provides an authentication entry point to the GD API via SSO
 * https://help.gooddata.com/display/developer/GoodData+PGP+Single+Sign-On
 *
 * @method loginSso
 * @param {String} sessionId PGP message
 * @param {String} serverUrl
 * @param {String} targetUrl
 */
export function loginSso(sessionId, serverUrl, targetUrl) {
    // cannot use xhr.get, server doesn't respond with JSON
    return ajax(`/gdc/account/customerlogin?sessionId=${sessionId}&serverURL=${serverUrl}&targetURL=${targetUrl}`, { method: 'GET' });
}

/**
 * Logs out current user
 * @method logout
 */
export function logout() {
    return isLoggedIn().then((loggedIn) => {
        if (loggedIn) {
            return get('/gdc/app/account/bootstrap').then((result) => {
                const userUri = result.bootstrapResource.accountSetting.links.self;
                const userId = userUri.match(/([^\/]+)\/?$/)[1]; // eslint-disable-line no-useless-escape

                return ajax(`/gdc/account/login/${userId}`, {
                    method: 'delete'
                });
            });
        }

        return Promise.resolve();
    });
}

/**
 * Updates user's profile settings
 * @method updateProfileSettings
 * @param {String} profileId - User profile identifier
 * @param {Object} profileSetting
*/
export function updateProfileSettings(profileId, profileSetting) {
    return put(`/gdc/account/profile/${profileId}/settings`, {
        data: profileSetting
    });
}

/**
 * Returns info about currently logged in user from bootstrap resource
 * @method getAccountInfo
 */
export function getAccountInfo() {
    return get('/gdc/app/account/bootstrap')
        .then((result) => {
            const br = result.bootstrapResource;
            const accountInfo = {
                login: br.accountSetting.login,
                loginMD5: br.current.loginMD5,
                firstName: br.accountSetting.firstName,
                lastName: br.accountSetting.lastName,
                organizationName: br.settings.organizationName,
                profileUri: br.accountSetting.links.self
            };

            return accountInfo;
        });
}

/**
 * Returns the feature flags valid for the currently logged in user.
 * @method getFeatureFlags
 */
export function getFeatureFlags() {
    return get('/gdc/app/account/bootstrap')
        .then(result => result.bootstrapResource.current.featureFlags);
}
