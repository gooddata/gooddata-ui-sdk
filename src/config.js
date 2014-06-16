// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
define([
], function(
) {
    'use strict';
    /**
     * Config module holds SDK configuration variables
     *
     * Currently its only custom domain - which enabled using
     * sdk from different domain (using CORS)
     *
     * Never set properties directly - always use setter methods
     *
     * @module config
     * @class config
     */

    var module = { domain: undefined },
        r = '(?:(https)://+|(www\\.)?)\\w[:;,\\.?\\[\\]\\w/~%&=+#-@!]*';

    /**
     * Sets custom domain. Parameter is url which has always to be https://
     * (if you don't provide it, we will do it for you).
     *
     * RegExp inspired taken from
     * https://github.com/jarib/google-closure-library/blob/master/closure/goog/string/linkify.js
     *
     * @method setCustomDomain
     */
    var setCustomDomain = function(d) {
        var link = d.match(r);

        if (!link) {
            throw new Error(d + ' is not a valid url');
        }

        // ensure https:// prefix
        // and strip possible trailing /
        module.domain = 'https://' + link[0]
                        .replace(/^https:\/\//, '')
                        .replace(/\/$/, '');
    };

    module.setCustomDomain = setCustomDomain;

    return module;
});


