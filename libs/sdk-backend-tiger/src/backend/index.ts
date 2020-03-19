// (C) 2019-2020 GoodData Corporation
import { AxiosInstance } from "axios";
import {
    AnalyticalBackendConfig,
    BackendCapabilities,
    IAnalyticalWorkspace,
    IWorkspaceQueryFactory,
    IUserService,
    ErrorConverter,
    NotAuthenticated,
    AuthProviderCallGuard,
} from "@gooddata/sdk-backend-spi";
import { newAxios, tigerClientFactory, ITigerClient } from "@gooddata/gd-tiger-client";
import isEmpty = require("lodash/isEmpty");
import defaultTo = require("lodash/defaultTo");

import { convertApiError } from "../errors/errorHandling";

import { TigerWorkspace } from "./workspace";
import { TigerWorkspaceQueryFactory } from "./workspaces";
import { TigerUserService } from "./user";
import {
    TigerAnalyticalBackend,
    TigerAuthProviderCallGuard,
    TigerAuthenticationProvider,
    TigerAuthenticatedPrincipal,
    TigerAuthenticatedAsyncCall,
    TigerAuthenticatedAsyncCallContext,
} from "../types";

const CAPABILITIES: BackendCapabilities = {
    canCalculateTotals: false,
    canExportCsv: false,
    canExportXlsx: false,
    canSortData: false,
    canTransformExistingResult: false,
    maxDimensions: 2,
    supportsElementUris: false,
    supportsObjectUris: false,
};

/**
 * Client-specific configuration for the tiger backend allows to specify additional telemetry information.
 *
 * @public
 */
export type TigerBackendConfig = {
    /**
     * Name of frontend package, this will be recorded by backend as initiator of HTTP requests.
     */
    packageName?: string;

    /**
     * Version of the frontend package, this will be recorded by backend as initiator of HTTP requests.
     */
    packageVersion?: string;
};

type TelemetryData = {
    componentName?: string;
    props?: string[];
};

/**
 * This implementation of analytical backend uses the goodata-js API client to realize the SPI.
 *
 * The only thing worth noting about this impl is the handling of SDK instance creation and authentication:
 *
 * - New instance of axios HTTP client is created for each instance of TigerBackend; new instance of TigerBackend is created
 *   every time onHostname, withCredentials or withTelemetry methods are called (similar to how we did it
 *   so far with the clone())
 *
 * - Authentication (login) is not currently done; TODO: configure axios to use basic auth supported by tiger
 *
 * - Authentication is done at construction time; the constructor MAY receive an instance of deferred authentication -
 *   this is to cater for cases when withCredentials is called, new instance of backend is returned and then
 *   someone calls withTelementry on this instance => in that case there is no need to reinitiate login.
 *
 */
export class TigerBackend implements TigerAnalyticalBackend {
    public readonly capabilities: BackendCapabilities = CAPABILITIES;
    public readonly config: AnalyticalBackendConfig;

    private readonly telemetry: TelemetryData;
    private readonly implConfig: any;
    private readonly sdk: ITigerClient;
    private readonly authProvider: TigerAuthProviderCallGuard | undefined;

    constructor(
        config: AnalyticalBackendConfig = {},
        implConfig: TigerBackendConfig = {},
        telemetry: TelemetryData = {},
        authProvider?: TigerAuthProviderCallGuard,
    ) {
        this.config = config;
        this.implConfig = implConfig;
        this.telemetry = telemetry;
        this.authProvider = authProvider;

        const axios = createAxios(this.config, this.implConfig, this.telemetry);
        this.sdk = tigerClientFactory(axios);
    }

    public onHostname(hostname: string): TigerAnalyticalBackend {
        return new TigerBackend({ ...this.config, hostname }, this.implConfig, this.telemetry);
    }

    public withTelemetry(componentName: string, props: object): TigerAnalyticalBackend {
        return new TigerBackend(this.config, this.implConfig, { componentName, props: Object.keys(props) });
    }

    public withAuthentication(provider: TigerAuthenticationProvider): TigerAnalyticalBackend {
        const guardedAuthProvider = new AuthProviderCallGuard(provider);

        return new TigerBackend(this.config, this.implConfig, this.telemetry, guardedAuthProvider);
    }

    public deauthenticate(): Promise<void> {
        return Promise.resolve();
    }

    public currentUser(): IUserService {
        return new TigerUserService(this.authApiCall);
    }

    public workspace(id: string): IAnalyticalWorkspace {
        return new TigerWorkspace(this.authApiCall, id);
    }

    public workspaces(): IWorkspaceQueryFactory {
        return new TigerWorkspaceQueryFactory(this.authApiCall);
    }

    public isAuthenticated(): Promise<TigerAuthenticatedPrincipal | null> {
        return Promise.resolve({ userId: "anonymouse" });
    }

    public authenticate(): Promise<TigerAuthenticatedPrincipal> {
        return Promise.resolve({ userId: "anonymouse" });
    }

    /**
     * Perform API call that requires authentication. The call will be decorated with error handling
     * such that not authenticated errors will trigger authentication flow AND other errors will be
     * converted using the provided converter and throw.
     *
     * @param call - a call which requires an authenticated session
     * @param errorConverter - converter from rest client errors to analytical backend errors
     */
    private authApiCall = async <TReturn>(
        call: TigerAuthenticatedAsyncCall<TReturn>,
        errorConverter: ErrorConverter = convertApiError,
    ): Promise<TReturn> => {
        return call(this.sdk, await this.getAsyncCallContext()).catch(err => {
            if (!isNotAuthenticatedError(err)) {
                throw errorConverter(err);
            }

            return this.triggerAuthentication()
                .then(async _ => {
                    return call(this.sdk, await this.getAsyncCallContext()).catch(e => {
                        throw errorConverter(e);
                    });
                })
                .catch(err2 => {
                    throw new NotAuthenticated("Current session is not authenticated.", err2);
                });
        });
    };

    private getAsyncCallContext = async (): Promise<TigerAuthenticatedAsyncCallContext> => {
        // use a default value that will not fail at runtime (e.g. null references) in case we are not authenticated yet
        // that way first call to authApiCall will proceed as if the principal was there and fail expectedly
        // thus triggering the auth process
        const principal = defaultTo(
            this.authProvider && (await this.authProvider.getCurrentPrincipal({ client: this.sdk })),
            {
                userId: "__invalid__",
            },
        );

        return {
            principal,
        };
    };

    private triggerAuthentication = (reset: boolean = false): Promise<TigerAuthenticatedPrincipal> => {
        if (!this.authProvider) {
            return Promise.reject(
                new NotAuthenticated("Backend is not set up with authentication provider."),
            );
        }

        if (reset) {
            this.authProvider.reset();
        }

        return this.authProvider.authenticate({ client: this.sdk });
    };
}

function createAxios(
    config: AnalyticalBackendConfig,
    implConfig: TigerBackendConfig,
    telemetry: TelemetryData,
): AxiosInstance {
    const baseUrl = config.hostname ? config.hostname : undefined;
    const headers = createHeaders(implConfig, telemetry);

    return newAxios(baseUrl, headers);
}

function createHeaders(implConfig: TigerBackendConfig, telemetry: TelemetryData): { [name: string]: string } {
    const headers: { [name: string]: string } = {};

    if (telemetry.componentName) {
        headers["X-GDC-JS-SDK-COMP"] = telemetry.componentName;
    }

    if (telemetry.props && !isEmpty(telemetry.props)) {
        headers["X-GDC-JS-SDK-COMP-PROPS"] = telemetry.props.join(",");
    }

    if (implConfig.packageName && implConfig.packageVersion) {
        headers["X-GDC-JS-PACKAGE"] = implConfig.packageName;
        headers["X-GDC-JS-PACKAGE-VERSION"] = implConfig.packageVersion;
    }

    return headers;
}

function isNotAuthenticatedError(err: any): boolean {
    return typeof err.response === "undefined" && err.response.status === 401;
}
