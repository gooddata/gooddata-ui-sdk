// (C) 2021 GoodData Corporation

/*
 * integrated tests run against wiremock which uses self-signed certificates. tell node.js not to bomb and
 * instead just issue warnings.
 *
 * alas, this does not work at the moment due to jest bug: https://github.com.cnpmjs.org/facebook/jest/issues/8449
 * the var must be set outside of jest in package.json. Once the bug gets fixed the variable can be removed from
 * package json.
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/*
 * Cookie domain rewriting - this patching is in place because Wiremock standalone does not support cookie
 * rewriting. It is possible through its programmatic API but that would mean we cannot use the 3rd party
 * standalone docker image.
 *
 * Thus, wiremock running on localhost returns platform's cookies with Domain=secure... but trying to add that
 * into the cookie-jar will bomb (Cookie not for current host's domain).
 *
 * So.. one way to go around this is to do rewriting on client side - while processing the request:
 *
 * -  monkey-patch the https module (all communication is through https, never http)
 * -  before sending request to real https, add Domain=secure...; to the Cookie (if any)
 * -  create the real request
 * -  instrument it with response listener that will be stripping Domain=secure...' from set-cookie
 * -  return the request
 *
 * This is transparent to the node-fetch that is used by the api-client.
 */

const https = require("https");
const originalRequest = https.request;

function stripDomain(cookies, domain) {
    if (!Array.isArray(cookies)) {
        return cookies.replace(`Domain=${domain};`, "");
    }

    return cookies.map((c) => {
        return c.replace(`Domain=${domain};`, "");
    });
}

function addDomain(cookies, domain) {
    if (!Array.isArray(cookies)) {
        return cookies + `; Domain=${domain}`;
    }

    return cookies.map((c) => {
        return c + `; Domain=${domain}`;
    });
}

https.request = function cookieRewritingRequestFactory(req) {
    const requestCookies = req.headers["cookie"];

    if (requestCookies) {
        req.headers["cookie"] = addDomain(requestCookies, "staging.anywhere.gooddata.com");
    }

    const newRequest = originalRequest.apply(this, arguments);

    newRequest.on("response", (res) => {
        const responseCookies = res.headers["set-cookie"];

        if (responseCookies) {
            res.headers["set-cookie"] = stripDomain(responseCookies, "staging.anywhere.gooddata.com");
        }
    });

    return newRequest;
};
