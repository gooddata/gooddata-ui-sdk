// (C) 2025-2026 GoodData Corporation

/* eslint-disable */
import globalAxios, { AxiosInstance, AxiosPromise, AxiosRequestConfig } from "axios";

// @ts-ignore
import { BASE_PATH, BaseAPI, COLLECTION_FORMATS, RequestArgs, RequiredError } from './base.js';
import {
    DUMMY_BASE_URL,
    assertParamExists,
    createRequestFunction,
    //serializeDataIfNeeded,
    //setApiKeyToObject,
    //setBasicAuthToObject,
    //setBearerAuthToObject,
    //setOAuthToObject,
    setSearchParams,
    toPathString,
} from "./common.js";
import { Configuration } from "./configuration.js";

export interface Invitation {
    email: string;
    userId: string;
    firstName?: string;
    lastName?: string;
}

// preferred version of action Api FP - ActionsApiAxiosParamCreator
/**
 * Puts a new invitation requirement into the invitation generator queue. This is a GoodData Cloud specific endpoint.
 * @summary Invite User
 * @param {Invitation} invitation
 * @param {*} [options] Override http request option.
 * @param {Configuration} [configuration] Optional configuration.
 * @throws {RequiredError}
 */
export async function ActionsApiAxiosParamCreator_ProcessInvitation(
    invitation: Invitation,
    options: AxiosRequestConfig = {},
    configuration?: Configuration,
): Promise<RequestArgs> {
    // verify required parameter 'invitation' is not null or undefined
    assertParamExists("processInvitation", "invitation", invitation);
    const localVarPath = `/api/v1/actions/invite`;
    // use dummy base URL string because the URL constructor only accepts absolute URLs.
    const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
    let baseOptions;
    if (configuration) {
        baseOptions = configuration.baseOptions;
    }
    const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
    const localVarHeaderParameter = {} as any;
    const localVarQueryParameter = {} as any;

    localVarHeaderParameter["Content-Type"] = "application/json";

    setSearchParams(localVarUrlObj, localVarQueryParameter);
    const headersFromBaseOptions = baseOptions?.headers ? baseOptions.headers : {};
    localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
    };
    const needsSerialization =
        typeof invitation !== "string" ||
        localVarRequestOptions.headers["Content-Type"] === "application/json";
    localVarRequestOptions.data = needsSerialization
        ? JSON.stringify(invitation !== undefined ? invitation : {})
        : invitation || "";

    return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
    };
}

/**
 * ActionsApi - axios parameter creator
 * @export
 */
export const ActionsApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Puts a new invitation requirement into the invitation generator queue. This is a GoodData Cloud specific endpoint.
         * @summary Invite User
         * @param {Invitation} invitation
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        processInvitation: async (
            invitation: Invitation,
            options: AxiosRequestConfig = {},
        ): Promise<RequestArgs> => {
            // verify required parameter 'invitation' is not null or undefined
            assertParamExists("processInvitation", "invitation", invitation);
            const localVarPath = `/api/v1/actions/invite`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: "POST", ...baseOptions, ...options };
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            localVarHeaderParameter["Content-Type"] = "application/json";

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            const headersFromBaseOptions = baseOptions?.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {
                ...localVarHeaderParameter,
                ...headersFromBaseOptions,
                ...options.headers,
            };
            const needsSerialization =
                typeof invitation !== "string" ||
                localVarRequestOptions.headers["Content-Type"] === "application/json";
            localVarRequestOptions.data = needsSerialization
                ? JSON.stringify(invitation !== undefined ? invitation : {})
                : invitation || "";

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    };
};
// preferred version of action Api FP
/**
 * Puts a new invitation requirement into the invitation generator queue. This is a GoodData Cloud specific endpoint.
 * @summary Invite User
 * @param {Invitation} invitation
 * @param {*} [options] Override http request option.
 * @param {Configuration} [configuration] Optional configuration.
 * @throws {RequiredError}
 */
export async function ActionsApiFp_ProcessInvitation(
    invitation: Invitation,
    options?: AxiosRequestConfig,
    configuration?: Configuration,
): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
    const localVarAxiosArgs = await ActionsApiAxiosParamCreator_ProcessInvitation(
        invitation,
        options || {},
        configuration,
    );
    return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
}

/**
 * ActionsApi - functional programming interface
 * @export
 */
export const ActionsApiFp = function (configuration?: Configuration) {
    const localVarAxiosParamCreator = ActionsApiAxiosParamCreator(configuration);
    return {
        /**
         * Puts a new invitation requirement into the invitation generator queue. This is a GoodData Cloud specific endpoint.
         * @summary Invite User
         * @param {Invitation} invitation
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async processInvitation(
            invitation: Invitation,
            options?: AxiosRequestConfig,
        ): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.processInvitation(invitation, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    };
};

/**
 * ActionsApi - interface
 * @export
 * @interface ActionsApi
 */
export interface ActionsApiInterface {
    /**
     * Puts a new invitation requirement into the invitation generator queue. This is a GoodData Cloud specific endpoint.
     * @summary Invite User
     * @param {ActionsApiProcessInvitationRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ActionsApiInterface
     */
    processInvitation(
        requestParameters: ActionsApiProcessInvitationRequest,
        options?: AxiosRequestConfig,
    ): AxiosPromise<void>;
}

/**
 * Request parameters for processInvitation operation in ActionsApi.
 * @export
 * @interface ActionsApiProcessInvitationRequest
 */
export interface ActionsApiProcessInvitationRequest {
    /**
     *
     * @type {Invitation}
     * @memberof ActionsApiProcessInvitation
     */
    readonly invitation: Invitation;
}

// preferred version ActionsApi
/**
 * ActionsApi - object-oriented interface
 * @export
 * @class ActionsApi
 * @extends {BaseAPI}
 */
export class ActionsApi extends BaseAPI implements ActionsApiInterface {
    /**
     * Puts a new invitation requirement into the invitation generator queue. This is a GoodData Cloud specific endpoint.
     * @summary Invite User
     * @param {ActionsApiProcessInvitationRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ActionsApi
     */
    public processInvitation(
        requestParameters: ActionsApiProcessInvitationRequest,
        options?: AxiosRequestConfig,
    ) {
        return ActionsApiFp_ProcessInvitation(requestParameters.invitation, options, this.configuration).then(
            (request) => request(this.axios, this.basePath),
        );
    }
}
