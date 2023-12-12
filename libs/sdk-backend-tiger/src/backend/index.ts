// (C) 2019-2023 GoodData Corporation
import { AxiosInstance, AxiosResponse } from "axios";
import { invariant } from "ts-invariant";
import {
    IAnalyticalBackendConfig,
    IBackendCapabilities,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    IAuthenticationProvider,
    IAuthenticatedPrincipal,
    IWorkspacesQueryFactory,
    IUserService,
    ErrorConverter,
    NotAuthenticated,
    IAuthenticationContext,
    isNotAuthenticated,
    IOrganization,
    IOrganizations,
    IEntitlements,
    isContractExpired,
} from "@gooddata/sdk-backend-spi";
import { newAxios, tigerClientFactory, ITigerClient } from "@gooddata/api-client-tiger";
import isEmpty from "lodash/isEmpty.js";
import isError from "lodash/isError.js";
import isString from "lodash/isString.js";
import inRange from "lodash/inRange.js";
import identity from "lodash/identity.js";
import omit from "lodash/omit.js";

import { convertApiError } from "../utils/errorHandling.js";

import { TigerWorkspace } from "./workspace/index.js";
import { TigerWorkspaceQueryFactory } from "./workspaces/index.js";
import { TigerUserService } from "./user/index.js";
import {
    AuthProviderCallGuard,
    AuthenticatedAsyncCall,
    IAuthenticatedAsyncCallContext,
    TelemetryData,
    AnonymousAuthProvider,
    IAuthProviderCallGuard,
} from "@gooddata/sdk-backend-base";
import { DateFormatter } from "../convertors/fromBackend/dateFormatting/types.js";
import { defaultDateFormatter } from "../convertors/fromBackend/dateFormatting/defaultDateFormatter.js";
import { TigerOrganization, TigerOrganizations } from "./organization/index.js";
import { LIB_VERSION, LIB_NAME } from "../__version.js";
import { TigerSpecificFunctions, buildTigerSpecificFunctions } from "./tigerSpecificFunctions.js";
import { TigerEntitlements } from "./entitlements/index.js";

const CAPABILITIES: IBackendCapabilities = {
    hasTypeScopedIdentifiers: true,
    canCalculateGrandTotals: true,
    canCalculateSubTotals: true,
    canCalculateNativeTotals: false,
    canCalculateTotals: true,
    canExportCsv: true,
    canExportXlsx: true,
    canSortData: false,
    canTransformExistingResult: false,
    canWorkspaceManagerSeeEverySharedObject: true,
    maxDimensions: 2,
    supportsElementUris: false,
    supportsObjectUris: false,
    supportsCsvUploader: false,
    supportsRankingFilter: true,
    supportsRankingFilterWithMeasureValueFilter: false,
    supportsElementsQueryParentFiltering: true,
    supportsKpiWidget: false,
    supportsWidgetEntity: false,
    supportsHyperlinkAttributeLabels: true,
    supportsGenericDateAttributeElements: true,
    supportsExplain: true,
    supportsAccessControl: true,
    usesStrictAccessControl: true,
    supportsOwners: true,
    allowsInconsistentRelations: true,
    supportsTimeGranularities: true,
    supportsHierarchicalWorkspaces: true,
    supportsCustomColorPalettes: true,
    supportsOrganizationSettings: true,
    supportsInlineMeasures: true,
    supportsBootstrapResource: false,
    supportsMetadataObjectLocking: false,
    supportsGranularAccessControl: true,
    supportsEveryoneUserGroupForAccessControl: true,
    supportsNonProductionDatasets: false,
    supportsShowAllAttributeValues: true,
    supportsSeparateLatitudeLongitudeLabels: true,
    supportsEnumeratingDatetimeAttributes: false,
    supportsHiddenAndLockedFiltersOnUI: true,
    supportsAttributeHierarchies: true,
    supportsSettingConnectingAttributes: false,
    supportsKeepingDependentFiltersSelection: true,
    supportsCircularDependencyInFilters: true,
    allowMultipleInteractionsPerAttributeAndMeasure: true,
    supportsShowingFilteredElements: true,
    supportsSingleSelectDependentFilters: true,
    supportsCrossFiltering: true,
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

    /**
     * Function used to format date values for a given granularity. It is given a parsed Date value and an appropriate granularity.
     * If not specified, a default date formatted will be used.
     */
    dateFormatter?: DateFormatter;
};

/**
 * Provides a way for the TigerBackend to expose some of its backend specific functions.
 */
type TigerSpecificFunctionsSubscription = {
    onTigerSpecificFunctionsReady?: (functions: TigerSpecificFunctions) => void;
    onContractExpired?: (tier: string) => void;
};

/**
 * An implementation of analytical backend for GoodData CloudNative (codename tiger).
 */
export class TigerBackend implements IAnalyticalBackend {
    public readonly capabilities: IBackendCapabilities = CAPABILITIES;
    public readonly config: IAnalyticalBackendConfig;

    private readonly telemetry: TelemetryData;
    private readonly implConfig: TigerBackendConfig & TigerSpecificFunctionsSubscription;
    private readonly client: ITigerClient;
    private readonly authProvider: IAuthProviderCallGuard;
    private readonly dateFormatter: DateFormatter;

    constructor(
        config: IAnalyticalBackendConfig = {},
        implConfig: TigerBackendConfig & TigerSpecificFunctionsSubscription = {},
        telemetry: TelemetryData = {},
        authProvider?: IAuthProviderCallGuard,
    ) {
        this.config = config;
        this.implConfig = implConfig;
        this.telemetry = telemetry;
        this.authProvider = authProvider || new AnonymousAuthProvider();
        this.dateFormatter = implConfig.dateFormatter ?? defaultDateFormatter;

        const axios = createAxios(this.config, this.implConfig, this.telemetry);
        interceptBackendErrorsToConsole(axios);

        this.client = tigerClientFactory(axios);

        this.authProvider.initializeClient?.(this.client);

        if (this.implConfig.onTigerSpecificFunctionsReady) {
            const specificFunctions = buildTigerSpecificFunctions(this, this.authApiCall);
            this.implConfig.onTigerSpecificFunctionsReady(specificFunctions);
        }
    }

    public onHostname(hostname: string): IAnalyticalBackend {
        return new TigerBackend({ ...this.config, hostname }, this.implConfig, this.telemetry);
    }

    public withTelemetry(componentName: string, props: object): IAnalyticalBackend {
        return new TigerBackend(
            this.config,
            this.implConfig,
            { componentName, props: Object.keys(props) },
            this.authProvider,
        );
    }

    public withAuthentication(provider: IAuthenticationProvider): IAnalyticalBackend {
        const guardedAuthProvider = new AuthProviderCallGuard(provider);

        return new TigerBackend(this.config, this.implConfig, this.telemetry, guardedAuthProvider);
    }

    public deauthenticate(): Promise<void> {
        if (!this.authProvider) {
            throw new NotAuthenticated("Backend is not set up with authentication provider.");
        }
        return this.authProvider.deauthenticate(this.getAuthenticationContext());
    }

    public organization(organizationId: string): IOrganization {
        return new TigerOrganization(this.authApiCall, organizationId);
    }

    public organizations(): IOrganizations {
        return new TigerOrganizations(this.authApiCall);
    }

    public entitlements(): IEntitlements {
        return new TigerEntitlements(this.authApiCall);
    }

    public currentUser(): IUserService {
        return new TigerUserService(this.authApiCall);
    }

    public workspace(id: string): IAnalyticalWorkspace {
        invariant(isString(id), `Invalid workspaceId, expected a string, got: ${id}`);
        return new TigerWorkspace(this.authApiCall, id, this.dateFormatter);
    }

    public workspaces(): IWorkspacesQueryFactory {
        return new TigerWorkspaceQueryFactory(this.authApiCall, this.dateFormatter);
    }

    public isAuthenticated = async (): Promise<IAuthenticatedPrincipal | null> => {
        try {
            // the return await is crucial here so that we also catch the async errors
            return await this.authProvider.getCurrentPrincipal({ client: this.client, backend: this });
        } catch (err) {
            if (isNotAuthenticatedResponse(err) || isNotAuthenticated(err)) {
                return null;
            }
            throw err;
        }
    };

    public authenticate = async (force: boolean): Promise<IAuthenticatedPrincipal> => {
        if (!force) {
            return this.authApiCall(async (client) => {
                const principal = await this.authProvider.getCurrentPrincipal({ client, backend: this });
                invariant(principal, "Principal must be defined");
                return principal;
            });
        }

        try {
            // the return await is crucial here so that we also catch the async errors
            return await this.triggerAuthentication(true);
        } catch (err) {
            invariant(isError(err)); // if this bombs, the code in the try block threw something strange
            throw this.handleAnalyticalBackendError(convertApiError(err));
        }
    };

    /**
     * Perform API call that requires authentication. The call will be decorated with error handling
     * such that not authenticated errors will trigger authentication flow AND other errors will be
     * converted using the provided converter and throw.
     *
     * @param call - a call which requires an authenticated session
     * @param errorConverter - converter from rest client errors to analytical backend errors
     */
    private authApiCall = async <T>(
        call: AuthenticatedAsyncCall<ITigerClient, T>,
        errorConverter: ErrorConverter = convertApiError,
    ): Promise<T> => {
        try {
            // the return await is crucial here so that we also catch the async errors
            return await call(this.client, await this.getAsyncCallContext());
        } catch (err) {
            invariant(isError(err)); // if this bombs, the code in the try block threw something strange

            // if we receive some other error than missing auth, we fail fast: no need to try the auth
            // one more time, since it was not the problem in the first place
            if (!isNotAuthenticatedResponse(err)) {
                throw this.handleAnalyticalBackendError(errorConverter(err));
            }

            // else we try to trigger the authentication once more and then we repeat the original call
            // with the newly obtained async call context
            try {
                await this.triggerAuthentication();
                // the return await is crucial here so that we also catch the async errors
                return await call(this.client, await this.getAsyncCallContext());
            } catch (err2) {
                invariant(isError(err2)); // if this bombs, the code in the try block threw something strange
                throw this.handleAnalyticalBackendError(errorConverter(err2));
            }
        }
    };

    /**
     * Triggers relevant handler if the provided error is an instance of
     * {@link @gooddata/sdk-backend-spi#NotAuthenticated} or {@link @gooddata/sdk-backend-spi#ContractExpired}.
     *
     * @param err - error to observe and trigger handler for
     * @returns the original error to facilitate re-throwing
     */
    private handleAnalyticalBackendError = <T>(err: T): T => {
        if (isNotAuthenticated(err)) {
            this.authProvider.onNotAuthenticated?.({ client: this.client, backend: this }, err);
        } else if (isContractExpired(err)) {
            this.implConfig.onContractExpired?.(err.message);
        }

        return err;
    };

    private getAuthenticationContext = (): IAuthenticationContext => {
        return { client: this.client, backend: this };
    };

    private getAsyncCallContext = async (): Promise<IAuthenticatedAsyncCallContext> => {
        const getPrincipal = async (): Promise<IAuthenticatedPrincipal> => {
            if (!this.authProvider) {
                throw new NotAuthenticated("Cannot obtain principal without an authProvider.");
            }

            const principal = await this.authProvider.getCurrentPrincipal({
                client: this.client,
                backend: this,
            });

            return principal ?? this.authProvider.authenticate(this.getAuthenticationContext());
        };

        return {
            getPrincipal,
        };
    };

    private triggerAuthentication = (reset = false): Promise<IAuthenticatedPrincipal> => {
        if (!this.authProvider) {
            return Promise.reject(
                new NotAuthenticated("Backend is not set up with authentication provider."),
            );
        }

        if (reset) {
            this.authProvider.reset();
        }

        return this.authProvider.authenticate({ client: this.client, backend: this });
    };
}

function createAxios(
    config: IAnalyticalBackendConfig,
    implConfig: TigerBackendConfig,
    telemetry: TelemetryData,
): AxiosInstance {
    const baseUrl = config.hostname ? config.hostname : undefined;
    const headers = createHeaders(implConfig, telemetry);

    return newAxios(baseUrl, headers);
}

function interceptBackendErrorsToConsole(client: AxiosInstance): AxiosInstance {
    client.interceptors.response.use(identity, (error) => {
        const response: AxiosResponse = error.response;

        // If there is no response object (for example for blocked requests), print the whole error.
        if (!response) {
            console.error("Tiger backend threw an error:", error);
        }
        // Else if the response is an object (JSON parsed by axios) and there is a problem, then log error
        // into console for easier diagnostics.
        else if (inRange(response.status, 400, 600) && typeof response.data === "object") {
            // Title is redundant (Bad Request)
            const details = omit(response.data, ["title"]);
            console.error("Tiger backend threw an error:", details);
        }

        return Promise.reject(error);
    });

    return client;
}

function createHeaders(implConfig: TigerBackendConfig, telemetry: TelemetryData): { [name: string]: string } {
    const headers: { [name: string]: string } = {
        "X-GDC-JS-PACKAGE": LIB_NAME,
        "X-GDC-JS-PACKAGE-VERSION": LIB_VERSION,
    };

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

function isNotAuthenticatedResponse(err: any): boolean {
    return err?.response?.status === 401;
}
