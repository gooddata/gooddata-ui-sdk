// (C) 2007-2022 GoodData Corporation
import isPlainObject from "lodash/isPlainObject";
import isFunction from "lodash/isFunction";
import set from "lodash/set";
import defaults from "lodash/defaults";
import merge from "lodash/merge";
import result from "lodash/result";
import pkgInfo from "../package.json";
import { stringify } from "./utils/queryString";

const { name: pkgName, version: pkgVersion } = pkgInfo;
/**
 * Ajax wrapper around GDC authentication mechanisms, SST and TT token handling and polling.
 * Interface is the same as original jQuery.ajax.
 *
 * If token is expired, current request is "paused", token is refreshed and request is retried and result
 * is transparently returned to the original call.
 *
 * Additionally polling is handled. Only final result of polling returned.
 * @module xhr
 * @class xhr
 */

const DEFAULT_POLL_DELAY = 1000;

const REST_API_VERSION_HEADER = "X-GDC-VERSION";
const REST_API_DEPRECATED_VERSION_HEADER = "X-GDC-DEPRECATED";

// The version used in X-GDC-VERSION header (see https://confluence.intgdc.com/display/Development/REST+API+versioning)
const LATEST_REST_API_VERSION = 5;

/**
 * Gooddata-js package signature
 * @private
 */
export const thisPackage = { name: pkgName, version: pkgVersion };

function simulateBeforeSend(url: string, settings: any) {
    const xhrMockInBeforeSend = {
        setRequestHeader(key: string, value: string) {
            set(settings, ["headers", key], value);
        },
    };

    if (isFunction(settings.beforeSend)) {
        settings.beforeSend(xhrMockInBeforeSend, url);
    }
}

function enrichSettingWithCustomDomain(originalUrl: string, originalSettings: any, domain: string): any {
    let url = originalUrl;
    const settings = originalSettings;
    if (domain) {
        // protect url to be prepended with domain on retry
        if (originalUrl.indexOf(domain) === -1) {
            url = domain + originalUrl;
        }
        settings.mode = "cors";
        settings.credentials = "include";
    }

    return { url, settings };
}

export function handlePolling(
    url: string,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    settings: any,
    sendRequest: (url: string, settings: any) => any,
): Promise<ApiResponse> {
    const pollingDelay: number = result(settings, "pollDelay");

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            sendRequest(url, settings).then(resolve, reject);
        }, pollingDelay);
    });
}

export interface IPackageHeaders {
    name: string;
    version: string;
}

export function originPackageHeaders({ name, version }: IPackageHeaders): object {
    return {
        "X-GDC-JS-PKG": name,
        "X-GDC-JS-PKG-VERSION": version,
    };
}

export class ApiError extends Error {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    constructor(message: string, public cause: any) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class ApiResponseError extends ApiError {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    constructor(message: string, public response: any, public responseBody: any) {
        super(message, null);
    }
}

export class ApiNetworkError extends ApiError {}

export class ApiResponse<T = any> {
    public response: Response;
    public responseBody: string;

    constructor(response: Response, responseBody: string) {
        this.response = response;
        this.responseBody = responseBody;
    }

    get data(): T {
        return this.getDataInner();
    }

    public getData(): T {
        return this.getDataInner();
    }

    public getHeaders(): Response {
        return this.response;
    }

    private getDataInner(): T {
        try {
            return JSON.parse(this.responseBody) as T;
        } catch (error) {
            throw new Error("Cannot parse responseBody.");
        }
    }
}

// the variable must be outside of the scope of the XhrModule to not log the message multiple times in SDK and KD
let shouldLogDeprecatedRestApiCall = true;

export class XhrModule {
    private tokenRequest?: any;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    constructor(private fetch: any, private configStorage: any) {
        defaults(configStorage, { xhrSettings: {} });
    }

    /**
     * Clears the indicator that is making the XHR module to perform token requests before making
     * the actual call. The module may get into this state typically during the application initialization
     * when the session is not yet authenticated.
     *
     * Calling this method will clear that indicator, ensuring that the next call will be called without
     * the leading call to token (which will typically fail).
     */
    public ensureNoLeadingTokenRequest(): void {
        this.tokenRequest = null;
    }

    /**
     * Back compatible method for setting common XHR settings
     *
     * Usually in our apps we used beforeSend ajax callback to set the X-GDC-REQUEST header with unique ID.
     *
     * @param settings object XHR settings as
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public ajaxSetup(settings: any) {
        Object.assign(this.configStorage.xhrSettings, settings);
    }

    public async ajax<T = any>(originalUrl: string, customSettings = {}): Promise<ApiResponse<T>> {
        // TODO refactor to: getRequestParams(originalUrl, customSettings);
        const firstSettings = this.createRequestSettings(customSettings);
        const { url, settings } = enrichSettingWithCustomDomain(
            originalUrl,
            firstSettings,
            this.configStorage.domain,
        );

        simulateBeforeSend(url, settings); // mutates `settings` param

        if (this.tokenRequest) {
            return this.continueAfterTokenRequest(url, settings);
        }

        let response;
        try {
            // TODO: We should clean up the settings at this point to be pure `RequestInit` object
            response = await this.fetch(url, settings);
        } catch (e) {
            throw new ApiNetworkError(e.message, e); // TODO is it really necessary? couldn't we throw just Error?
        }

        // Fetch URL and resolve body promise (if left unresolved, the body isn't even shown in chrome-dev-tools)
        const responseBody = await response.text();

        if (response.status === 401) {
            // if 401 is in login-request, it means wrong user/password (we wont continue)
            const isLoginRequest = url.indexOf("/gdc/account/login") !== -1;
            // if 401 is in token request already, it makes no sense to try handling unauthorized again by calling the same token endpoint again
            const isTokenRequest = url.indexOf("/gdc/account/token") !== -1;

            const shouldSkipUnauthorizedHandling = isLoginRequest || isTokenRequest;

            if (shouldSkipUnauthorizedHandling) {
                throw new ApiResponseError("Unauthorized", response, responseBody);
            }

            return this.handleUnauthorized(url, settings);
        }

        // Note: Fetch does redirects automagically for 301 (and maybe more .. TODO when?)
        // see https://fetch.spec.whatwg.org/#ref-for-concept-request%E2%91%A3%E2%91%A2
        if (response.status === 202 && !settings.dontPollOnResult) {
            // poll on new provided url, fallback to the original one
            // (for example validElements returns 303 first with new url which may then return 202 to poll on)
            let responseJson;
            try {
                responseJson = JSON.parse(responseBody);
            } catch (err) {
                responseJson = {};
            }

            let finalUrl = responseJson.uri ?? response.url ?? url;

            const finalSettings = settings;

            // if the response is 202 and Location header is not empty, let's poll on the new Location
            if (response.headers.has("Location")) {
                finalUrl = response.headers.get("Location");
            }
            finalSettings.method = "GET";
            delete finalSettings.data;
            delete finalSettings.body;

            return handlePolling(finalUrl, finalSettings, this.ajax.bind(this));
        }

        this.verifyRestApiDeprecationStatus(response.headers);

        if (response.status >= 200 && response.status <= 399) {
            return new ApiResponse(response, responseBody);
        }

        // throws on 400, 500, etc.
        throw new ApiResponseError(response.statusText, response, responseBody);
    }

    /**
     * Wrapper for xhr.ajax method GET
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public get(url: string, settings?: any): Promise<ApiResponse<any>> {
        return this.ajax(url, merge({ method: "GET" }, settings));
    }

    /**
     * Wrapper for xhr.ajax method GET, returns parsed JSON response body
     */
    public getParsed<T>(url: string, settings: any = {}): Promise<T> {
        const { data, ...restSettings } = settings;
        let urlWithParams = url;
        if (data) {
            urlWithParams = `${url}?${stringify(data)}`;
        }
        return this.ajax<T>(urlWithParams, merge({ method: "GET" }, restSettings)).then((response) =>
            response.getData(),
        );
    }

    /**
     * Wrapper for xhr.ajax method HEAD
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public head(url: string, settings?: any): Promise<ApiResponse<any>> {
        return this.ajax(url, merge({ method: "HEAD" }, settings));
    }

    /**
     * Wrapper for xhr.ajax method POST
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public post(url: string, settings?: any): Promise<ApiResponse<any>> {
        return this.ajax(url, merge({ method: "POST" }, settings));
    }

    /**
     * Wrapper for xhr.ajax method POST, returns parsed JSON response body
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public postParsed<T>(url: string, settings?: any): Promise<T> {
        return this.ajax<T>(url, merge({ method: "POST" }, settings)).then((response) => response.getData());
    }

    /**
     * Wrapper for xhr.ajax method PUT
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public put(url: string, settings: any): Promise<ApiResponse<any>> {
        return this.ajax(url, merge({ method: "PUT" }, settings));
    }

    /**
     * Wrapper for xhr.ajax method DELETE
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public del(url: string, settings?: any): Promise<ApiResponse<any>> {
        return this.ajax(url, merge({ method: "DELETE" }, settings));
    }

    private createRequestSettings(customSettings: any) {
        const settings = merge(
            {
                headers: {
                    Accept: "application/json; charset=utf-8",
                    "Content-Type": "application/json",
                    [REST_API_VERSION_HEADER]: LATEST_REST_API_VERSION,
                    ...originPackageHeaders(this.configStorage.originPackage || thisPackage),
                },
            },
            this.configStorage.xhrSettings,
            customSettings,
        );

        settings.pollDelay = settings.pollDelay !== undefined ? settings.pollDelay : DEFAULT_POLL_DELAY;

        // TODO jquery compat - add to warnings
        settings.body = settings.data ? settings.data : settings.body;
        settings.mode = "same-origin";
        settings.credentials = "same-origin";

        if (isPlainObject(settings.body)) {
            settings.body = JSON.stringify(settings.body);
        }

        return settings;
    }

    private continueAfterTokenRequest(url: string, settings: any) {
        return this.tokenRequest.then(
            async (response: Response) => {
                if (!response.ok) {
                    throw new ApiResponseError("Unauthorized", response, null);
                }
                this.tokenRequest = null;

                return this.ajax(url, settings);
            },
            (reason: any) => {
                this.tokenRequest = null;
                return reason;
            },
        );
    }

    private async handleUnauthorized(originalUrl: string, originalSettings: any) {
        // Create only single token request for any number of waiting request.
        // If token request exist, just listen for it's end.
        if (this.tokenRequest) {
            return this.continueAfterTokenRequest(originalUrl, originalSettings);
        }

        const { url, settings } = enrichSettingWithCustomDomain(
            "/gdc/account/token",
            this.createRequestSettings({}),
            this.configStorage.domain,
        );

        simulateBeforeSend(url, settings); // mutates `settings` param

        this.tokenRequest = this.fetch(url, settings);
        const response = await this.tokenRequest;
        const responseBody = await response.text();
        this.tokenRequest = null;
        // TODO jquery compat - allow to attach unauthorized callback and call it if attached
        // if ((xhrObj.status === 401) && (isFunction(req.unauthorized))) {
        //     req.unauthorized(xhrObj, textStatus, err, deferred);
        //     return;
        // }
        // unauthorized handler is not defined or not http 401
        // unauthorized when retrieving token -> not logged

        if (response.status === 401) {
            throw new ApiResponseError("Unauthorized", response, responseBody);
        }

        return this.ajax(originalUrl, originalSettings);
    }

    private logDeprecatedRestApiCall(deprecatedVersionDetails: string) {
        // eslint-disable-next-line no-console
        console.warn(
            `The REST API version ${LATEST_REST_API_VERSION} is deprecated (${deprecatedVersionDetails}). ` +
                "Please migrate your application to use GoodData.UI SDK or @gooddata/api-client-bear package that " +
                "supports newer version of the API.",
        );
    }

    private isRestApiDeprecated(responseHeaders: any) {
        return responseHeaders.has(REST_API_DEPRECATED_VERSION_HEADER);
    }

    private verifyRestApiDeprecationStatus(responseHeaders: any) {
        if (shouldLogDeprecatedRestApiCall && this.isRestApiDeprecated(responseHeaders)) {
            const deprecatedVersionDetails = responseHeaders.get(REST_API_DEPRECATED_VERSION_HEADER);
            this.logDeprecatedRestApiCall(deprecatedVersionDetails);
            shouldLogDeprecatedRestApiCall = false;
        }
    }
}
