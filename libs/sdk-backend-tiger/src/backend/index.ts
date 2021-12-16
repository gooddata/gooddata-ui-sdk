// (C) 2019-2022 GoodData Corporation
import { AxiosInstance, AxiosResponse } from "axios";
import invariant from "ts-invariant";
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
} from "@gooddata/sdk-backend-spi";
import { newAxios, tigerClientFactory, ITigerClient, jsonApiHeaders } from "@gooddata/api-client-tiger";
import isEmpty from "lodash/isEmpty";
import isString from "lodash/isString";
import inRange from "lodash/inRange";
import identity from "lodash/identity";
import omit from "lodash/omit";

import { convertApiError } from "../utils/errorHandling";

import { TigerWorkspace } from "./workspace";
import { TigerWorkspaceQueryFactory } from "./workspaces";
import { TigerUserService } from "./user";
import {
    AuthProviderCallGuard,
    AuthenticatedAsyncCall,
    IAuthenticatedAsyncCallContext,
    TelemetryData,
    AnonymousAuthProvider,
    IAuthProviderCallGuard,
} from "@gooddata/sdk-backend-base";
import { DateFormatter } from "../convertors/fromBackend/dateFormatting/types";
import { createDefaultDateFormatter } from "../convertors/fromBackend/dateFormatting/defaultDateFormatter";
import { TigerOrganization, TigerOrganizations } from "./organization";

const CAPABILITIES: IBackendCapabilities = {
    hasTypeScopedIdentifiers: true,
    canCalculateGrandTotals: true,
    canCalculateSubTotals: false,
    canCalculateNativeTotals: false,
    canCalculateTotals: false,
    canExportCsv: false,
    canExportXlsx: false,
    canSortData: false,
    canTransformExistingResult: false,
    maxDimensions: 2,
    supportsElementUris: false,
    supportsObjectUris: false,
    supportsCsvUploader: false,
    supportsRankingFilter: true,
    supportsRankingFilterWithMeasureValueFilter: false,
    supportsElementsQueryParentFiltering: false,
    supportsKpiWidget: false,
    supportsWidgetEntity: false,
    supportsHyperlinkAttributeLabels: false,
    supportsGenericDateAttributeElements: false,
    supportsExplain: true,
    supportsAccessControl: false,
    usesStrictAccessControl: true,
    supportsOwners: false,
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
 * TigerBackend-specific functions.
 * If possible, avoid these functions, they are here for specific use cases.
 */
type TigerSpecificFunctions = {
    isCommunityEdition?: () => Promise<boolean>;
};

/**
 * Provides a way for the BearBackend to expose some of its backend specific functions.
 */
type TigerSpecificFunctionsSubscription = {
    onTigerSpecificFunctionsReady?: (functions: TigerSpecificFunctions) => void;
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
        this.dateFormatter = implConfig.dateFormatter ?? createDefaultDateFormatter();

        const axios = createAxios(this.config, this.implConfig, this.telemetry);
        interceptBackendErrorsToConsole(axios);

        this.client = tigerClientFactory(axios);

        this.authProvider.initializeClient?.(this.client);

        if (this.implConfig.onTigerSpecificFunctionsReady) {
            const specificFunctions: TigerSpecificFunctions = {
                isCommunityEdition: async () => {
                    try {
                        return await this.authApiCall(async (sdk) => {
                            const response = await sdk.organizationObjects.getAllEntitiesWorkspaces(
                                { page: 0, size: 1 },
                                { headers: jsonApiHeaders },
                            );

                            // the header name are all lowercase in this object
                            return response.headers["gooddata-deployment"] === "aio";
                        });
                    } catch {
                        return false;
                    }
                },
            };

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

    public isAuthenticated = (): Promise<IAuthenticatedPrincipal | null> => {
        return new Promise((resolve, reject) => {
            this.authProvider
                .getCurrentPrincipal({ client: this.client, backend: this })
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    if (isNotAuthenticatedResponse(err) || isNotAuthenticated(err)) {
                        resolve(null);
                    }

                    reject(err);
                });
        });
    };

    public authenticate = (force: boolean): Promise<IAuthenticatedPrincipal> => {
        if (!force) {
            return this.authApiCall(async (client) => {
                const principal = await this.authProvider.getCurrentPrincipal({ client, backend: this });
                invariant(principal, "Principal must be defined");
                return principal!;
            });
        }

        return this.triggerAuthentication(true)
            .catch((e) => {
                throw convertApiError(e);
            })
            .catch(this.handleNotAuthenticated);
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
        return call(this.client, await this.getAsyncCallContext())
            .catch((err) => {
                if (!isNotAuthenticatedResponse(err)) {
                    throw errorConverter(err);
                }

                return this.triggerAuthentication()
                    .then(async (_) => {
                        return call(this.client, await this.getAsyncCallContext()).catch((e) => {
                            throw errorConverter(e);
                        });
                    })
                    .catch((err2) => {
                        throw errorConverter(err2);
                    });
            })
            .catch(this.handleNotAuthenticated);
    };

    private handleNotAuthenticated = (err: unknown): never => {
        if (isNotAuthenticated(err)) {
            this.authProvider.onNotAuthenticated?.({ client: this.client, backend: this }, err);
        }

        throw err;
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
            if (principal) {
                return principal;
            }

            return this.authProvider.authenticate(this.getAuthenticationContext());
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
            // eslint-disable-next-line no-console
            console.error("Tiger backend threw an error:", error);
        }
        // Else if the response is an object (JSON parsed by axios) and there is a problem, then log error
        // into console for easier diagnostics.
        else if (inRange(response.status, 400, 600) && typeof response.data === "object") {
            // Title is redundant (Bad Request)
            const details = omit(response.data, ["title"]);
            // eslint-disable-next-line no-console
            console.error("Tiger backend threw an error:", details);
        }

        return Promise.reject(error);
    });

    return client;
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

function isNotAuthenticatedResponse(err: any): boolean {
    return err?.response?.status === 401;
}
