// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
define(['./xhr'], function(xhr) {
    'use strict';

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
    var isLoggedIn = function() {
        return $.getJSON('/gdc/account/token');
    };


    /**
     * This function provides an authentication entry point to the GD API. It is needed to authenticate
     * by calling this function prior any other API calls. After providing valid credentials
     * every subsequent API call in a current session will be authenticated.
     *
     * @method login
     * @param {String} username
     * @param {String} password
     */
    var login = function(username, password) {
        return xhr.post("/gdc/account/login", {
            data: JSON.stringify({
                postUserLogin: {
                    login: username,
                    password: password,
                    remember: 1,
                    captcha: "",
                    verifyCaptcha: ""
                }
            })
        });
    };

    /**
     * Logs out current user
     * @method logout
     */
    var logout = function() {
        var d = $.Deferred();

        isLoggedIn().then(function() {
            return xhr.get('/gdc/app/account/bootstrap').then(function(result) {
                var userUri = result.bootstrapResource.accountSetting.links.self;
                var userId = userUri.match(/([^\/]+)\/?$/)[1];

                return userId;
            }, d.reject);
        }, d.resolve).then(function(userId) {
            return xhr.ajax('/gdc/account/login/' + userId, {
                method: 'delete'
            });
        }).then(d.resolve, d.reject);

        return d.promise();
    };

    /**
     * Returns info about currently logged in user from bootstrap resource
     * @method getAccountInfo
     */
    var getAccountInfo = function() {
        var d = $.Deferred();

        xhr.get('/gdc/app/account/bootstrap').then(function(result) {
            var br = result.bootstrapResource;
            var accountInfo = {
                login: br.accountSetting.login,
                loginMD5: br.current.loginMD5,
                firstName: br.accountSetting.firstName,
                lastName: br.accountSetting.lastName,
                organizationName: br.settings.organizationName
            };

            d.resolve(accountInfo);
        }, d.reject);

        return d.promise();
    };


    return {
        isLoggedIn: isLoggedIn,
        login: login,
        logout: logout,
        getAccountInfo: getAccountInfo
    };
});
