// (C) 2019-2022 GoodData Corporation
import { factory as createSdk, SDK } from "@gooddata/api-client-bear";
import {
    IAnalyticalBackendConfig,
    IAuthenticatedPrincipal,
    IAuthenticationContext,
    ErrorConverter,
    IBackendCapabilities,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    IAuthenticationProvider,
    NotAuthenticated,
    IWorkspacesQueryFactory,
    IUserService,
    isNotAuthenticated,
    IOrganization,
    IOrganizations,
} from "@gooddata/sdk-backend-spi";
import { IInsight } from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import isEmpty from "lodash/isEmpty";
import isError from "lodash/isError";
import { convertApiError, isApiResponseError } from "../utils/errorHandling";
import { BearWorkspace } from "./workspace";
import { BearWorkspaceQueryFactory } from "./workspaces";
import { BearUserService } from "./user";
import { convertInsight } from "../convertors/toBackend/InsightConverter";
import {
    GdcUser,
    GdcProjectDashboard,
    GdcMetadataObject,
    GdcVisualizationObject,
} from "@gooddata/api-model-bear";
import { sanitizeDrillingActivationPostMessageData } from "./drillingPostMessageData";
import {
    IAuthProviderCallGuard,
    NoopAuthProvider,
    AuthenticatedAsyncCall,
    IAuthenticatedAsyncCallContext,
    AuthProviderCallGuard,
    TelemetryData,
} from "@gooddata/sdk-backend-base";
import { IDrillableItemsCommandBody } from "@gooddata/sdk-embedding";
import { BearOrganization, BearOrganizations } from "./organization";
import packageJson from "../../package.json";

const CAPABILITIES: IBackendCapabilities = {
    canCalculateGrandTotals: true,
    canCalculateSubTotals: true,
    canCalculateTotals: true,
    canCalculateNativeTotals: true,
    canExportCsv: true,
    canExportXlsx: true,
    canSortData: true,
    canTransformExistingResult: false,
    maxDimensions: 2,
    supportsElementUris: true,
    supportsObjectUris: true,
    supportsCsvUploader: true,
    supportsLegacyReports: true,
    supportsRankingFilter: true,
    supportsRankingFilterWithMeasureValueFilter: true,
    supportsElementsQueryParentFiltering: true,
    supportsKpiWidget: true,
    supportsWidgetEntity: true,
    supportsHyperlinkAttributeLabels: true,
    supportsGenericDateAttributeElements: true,
    supportsExplain: false,
    supportsAccessControl: true,
    usesStrictAccessControl: false,
    supportsOwners: true,
    allowsInconsistentRelations: false,
    supportsTimeGranularities: false,
};

/**
 * Client-specific configuration for the bear backend allows to specify additional telemetry information.
 *
 * @public
 */
export type BearBackendConfig = {
    /**
     * Name of frontend package, this will be recorded by backend as initiator of HTTP requests.
     */
    packageName?: string;

    /**
     * Version of the frontend package, this will be recorded by backend as initiator of HTTP requests.
     */
    packageVersion?: string;
};

/**
 * BearBackend-specific legacy functions.
 * Do not use these functions to implement any new functionality! These are here only to support certain
 * legacy cases where migration to proper sdk-backend-spi API is not feasible/wanted.
 */
type BearLegacyFunctions = {
    openAsReport?(workspace: string, insight: IInsight): Promise<string>;
    getBootstrapResource?(options: {
        projectId?: string;
        productId?: string;
        clientId?: string;
    }): Promise<GdcUser.IBootstrapResource>;
    ajaxSetup?(setup: any): void;
    log?(uri: string, logMessages: string[]): Promise<any>;
    updateProfileCurrentWorkspace?(workspace: string, profileSetting: GdcUser.IProfileSetting): Promise<void>;
    sanitizeDrillingActivationPostMessageData?(
        workspace: string,
        postMessageData: IDrillableItemsCommandBody,
    ): Promise<IDrillableItemsCommandBody>;
    getProjectDashboards?(workspace: string): Promise<GdcProjectDashboard.IWrappedProjectDashboard[]>;
    getUrisFromIdentifiers?(
        workspace: string,
        identifiers: string[],
    ): Promise<{ uri: string; identifier: string }[]>;
    getObjectsByUri?(workspace: string, uris: string[]): Promise<GdcMetadataObject.WrappedObject[]>;
    getVisualizationObject?(workspace: string, uri: string): Promise<GdcVisualizationObject.IVisualization>;
    getUISettings?(): Promise<{ settings: GdcUser.IUISettings }>;
    isDomainAdmin?(domainUri: string): Promise<boolean>;
};

/**
 * Provides a way for the BearBackend to expose some of its backend specific functions.
 */
type LegacyFunctionsSubscription = {
    onLegacyFunctionsReady?(functions: BearLegacyFunctions): void;
};

/**
 * Provides a way to specify legacy settings when creating a new instance.
 */
type LegacySetup = {
    ajaxSettings?: any;
};

/**
 * Provides a way to use custom factory for creating SDK instances.
 */
type FactoryFunction = {
    factory?: (config?: any) => SDK;
};

/**
 * This implementation of analytical backend uses the gooddata-js API client to realize the SPI.
 *
 * The only thing worth noting about this impl is the handling of SDK instance creation and authentication:
 *
 * - New instance of SDK is created for each instance of BearBackend; new instance of BearBackend is created
 *   every time onHostname, withCredentials or withTelemetry methods are called (similar to how we did it
 *   so far with the clone())
 *
 * - Authentication (login) WILL be done every time credentials are provided using the
 *   withCredentials. No other methods in the bear backend lead to login.
 *
 * - Authentication is done at construction time; the constructor MAY receive an instance of deferred authentication -
 *   this is to cater for cases when withCredentials is called, new instance of backend is returned and then
 *   someone calls withTelemetry on this instance ⇒ in that case there is no need to re-initiate login.
 *
 */
export class BearBackend implements IAnalyticalBackend {
    public readonly capabilities: IBackendCapabilities = CAPABILITIES;
    public readonly config: IAnalyticalBackendConfig;

    private readonly telemetry: TelemetryData;
    private readonly implConfig: any;
    private readonly authProvider: IAuthProviderCallGuard;
    private readonly sdk: SDK;

    // used to reconstruct and reapply the config when copying backend in withTelemetry and others
    private lastAjaxSetupSettings: any;

    constructor(
        config?: IAnalyticalBackendConfig,
        implConfig?: BearBackendConfig & LegacyFunctionsSubscription & FactoryFunction & LegacySetup,
        telemetry?: TelemetryData,
        authProvider?: IAuthProviderCallGuard,
    ) {
        this.config = configSanitize(config);
        this.implConfig = bearConfigSanitize(implConfig);
        this.telemetry = telemetrySanitize(telemetry);
        this.authProvider = authProvider || new NoopAuthProvider();
        this.sdk = newSdkInstance(this.config, this.implConfig, this.telemetry);

        // do the ajax setup without the need to call the ajaxSetup legacy function
        // this is useful when deriving new instance using withTelemetry and similar functions
        if (this.implConfig.ajaxSettings) {
            this.sdk.xhr.ajaxSetup(this.implConfig.ajaxSettings);
        }

        this.authProvider.initializeClient?.(this.sdk);

        if (this.implConfig.onLegacyCallbacksReady) {
            const legacyFunctions: BearLegacyFunctions = {
                openAsReport: (workspace, insight) => {
                    const visualizationObject = convertInsight(insight);
                    return this.authApiCall((sdk) =>
                        sdk.md.openVisualizationAsReport(workspace, { visualizationObject }),
                    );
                },

                getBootstrapResource: (options) => {
                    return this.authApiCall((sdk) => sdk.user.getBootstrapResource(options));
                },

                ajaxSetup: (settings) => {
                    // store the last used settings so that we can use them if copying this backend in withTelemetry for example
                    this.lastAjaxSetupSettings = settings;
                    this.sdk.xhr.ajaxSetup(settings);
                },

                log: (uri, logMessages) => this.sdk.xhr.post(uri, { data: JSON.stringify({ logMessages }) }),

                updateProfileCurrentWorkspace: async (workspace, profileSetting): Promise<void> => {
                    const userId = profileSetting.links?.profile?.split("/").pop();
                    invariant(userId, "Cannot obtain userId from IProfileSetting");

                    const newProfileSetting: GdcUser.IProfileSetting = {
                        ...profileSetting,
                        currentProjectUri: `/gdc/projects/${workspace}`,
                    };

                    await this.authApiCall((sdk) =>
                        sdk.user.updateProfileSettings(userId!, { profileSetting: newProfileSetting }),
                    );
                },

                sanitizeDrillingActivationPostMessageData: (workspace, postMessageData) =>
                    sanitizeDrillingActivationPostMessageData(
                        workspace,
                        postMessageData,
                        (workspace, identifiers) =>
                            this.authApiCall((sdk) => sdk.md.getUrisFromIdentifiers(workspace, identifiers)),
                    ),

                getProjectDashboards: (workspace) => {
                    return this.authApiCall((sdk) => sdk.md.getProjectDashboards(workspace));
                },

                getUrisFromIdentifiers: (workspace, identifiers) => {
                    return this.authApiCall((sdk) => sdk.md.getUrisFromIdentifiers(workspace, identifiers));
                },

                getObjectsByUri: (workspace, uris) => {
                    return this.authApiCall((sdk) => sdk.md.getObjects(workspace, uris));
                },

                getVisualizationObject: (workspace, uri) => {
                    return this.authApiCall(async (sdk) => {
                        const [visObject] = await sdk.md.getObjects<GdcVisualizationObject.IVisualization>(
                            workspace,
                            [uri],
                        );

                        return visObject;
                    });
                },

                getUISettings: () => {
                    return this.sdk.xhr
                        .get("/gdc/account/organization/settings")
                        .then((response) => response.getData());
                },

                isDomainAdmin: (domainUri: string): Promise<boolean> => {
                    return this.authApiCall((sdk) => {
                        return sdk.xhr
                            .get(`${domainUri}/config`)
                            .then((_) => true)
                            .catch((error) => {
                                if (isApiResponseError(error)) {
                                    // when user _is not_ domain admin, then attempting to retrieve domain config
                                    // will fail fast with 403
                                    return error.response.status !== 403;
                                }

                                return true;
                            });
                    });
                },
            };

            this.implConfig.onLegacyCallbacksReady(legacyFunctions);
        }
    }

    public onHostname(hostname: string): IAnalyticalBackend {
        return new BearBackend({ ...this.config, hostname }, this.implConfig, this.telemetry);
    }

    public withTelemetry(componentName: string, props: object): IAnalyticalBackend {
        return new BearBackend(
            this.config,
            { ...this.implConfig, ajaxSettings: this.lastAjaxSetupSettings },
            { componentName, props: Object.keys(props) },
            this.authProvider,
        );
    }

    public withAuthentication(provider: IAuthenticationProvider): IAnalyticalBackend {
        const guardedAuthProvider = new AuthProviderCallGuard(provider);

        return new BearBackend(this.config, this.implConfig, this.telemetry, guardedAuthProvider);
    }

    public isAuthenticated = async (): Promise<IAuthenticatedPrincipal | null> => {
        try {
            // the return await is crucial here so that we also catch the async errors
            return await this.authProvider.getCurrentPrincipal({ client: this.sdk, backend: this });
        } catch (err) {
            if (isNotAuthenticatedResponse(err)) {
                return null;
            }
            throw err;
        }
    };

    public authenticate = (force: boolean): Promise<IAuthenticatedPrincipal> => {
        if (!force) {
            return this.authApiCall(async (sdk) => {
                const principal = await this.authProvider.getCurrentPrincipal({ client: sdk, backend: this });
                invariant(principal, "Principal must be defined");
                return principal!;
            });
        }

        return this.triggerAuthentication(true);
    };

    public deauthenticate(): Promise<void> {
        if (!this.authProvider) {
            throw new NotAuthenticated("Backend is not set up with authentication provider.");
        }
        return this.authProvider.deauthenticate(this.getAuthenticationContext());
    }

    public organization(organizationId: string): IOrganization {
        return new BearOrganization(this.authApiCall, organizationId);
    }

    public organizations(): IOrganizations {
        return new BearOrganizations(this.authApiCall);
    }

    public currentUser(): IUserService {
        return new BearUserService(this.authApiCall);
    }

    public workspace(id: string): IAnalyticalWorkspace {
        return new BearWorkspace(this.authApiCall, id);
    }

    public workspaces(): IWorkspacesQueryFactory {
        return new BearWorkspaceQueryFactory(this.authApiCall);
    }

    /**
     * Perform API call that requires authentication. The call will be decorated with error handling
     * such that not authenticated errors will trigger authentication flow AND other errors will be
     * converted using the provided converter and throw.
     *
     * @param call - a call which requires an authenticated session
     * @param errorConverter - converter from rest client errors to analytical backend errors
     */
    public authApiCall = async <T>(
        call: AuthenticatedAsyncCall<SDK, T>,
        errorConverter: ErrorConverter = convertApiError,
    ): Promise<T> => {
        return call(this.sdk, await this.getAsyncCallContext())
            .catch((err) => {
                if (!isNotAuthenticatedResponse(err)) {
                    throw errorConverter(err);
                }

                return this.triggerAuthentication()
                    .then(async (_) => {
                        return call(this.sdk, await this.getAsyncCallContext()).catch((e) => {
                            throw errorConverter(e);
                        });
                    })
                    .catch((err2) => {
                        throw errorConverter(err2);
                    });
            })
            .catch(this.handleNotAuthenticated);
    };

    private getAuthenticationContext = (): IAuthenticationContext => ({ client: this.sdk, backend: this });

    private triggerAuthentication = async (reset = false): Promise<IAuthenticatedPrincipal> => {
        if (!this.authProvider) {
            throw new NotAuthenticated("Backend is not set up with authentication provider.");
        }

        if (reset) {
            this.authProvider.reset();
        }

        try {
            // the return await is crucial here so that we also catch the async errors
            return await this.authProvider.authenticate(this.getAuthenticationContext());
        } catch (e: unknown) {
            invariant(isError(e)); // if this bombs, the code in the try block threw something strange
            throw this.handleNotAuthenticated2(convertApiError(e));
        }
    };

    /**
     * Triggers onNotAuthenticated handler of the the authProvider if the provided error is an instance of {@link @gooddata/sdk-backend-spi#NotAuthenticated}.
     *
     * @param err - error to observe and trigger handler for
     * @returns the original error to facilitate re-throwing
     */
    private handleNotAuthenticated2 = <T>(err: T): T => {
        if (isNotAuthenticated(err)) {
            this.authProvider.onNotAuthenticated?.({ client: this.sdk, backend: this }, err);
        }
        return err;
    };

    private handleNotAuthenticated = (err: unknown): never => {
        throw this.handleNotAuthenticated2(err);
    };

    private getAsyncCallContext = async (): Promise<IAuthenticatedAsyncCallContext> => {
        const getPrincipal = async (): Promise<IAuthenticatedPrincipal> => {
            if (!this.authProvider) {
                throw new NotAuthenticated("Cannot obtain principal without an authProvider.");
            }

            const principal = await this.authProvider.getCurrentPrincipal({
                client: this.sdk,
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
}

//
// internals
//

function isNotAuthenticatedResponse(err: any): boolean {
    return isApiResponseError(err) && err.response.status === 401;
}

function configSanitize(config?: IAnalyticalBackendConfig): IAnalyticalBackendConfig {
    return config ? config : {};
}

function bearConfigSanitize(implConfig?: BearBackendConfig): BearBackendConfig {
    return implConfig ? implConfig : {};
}

function telemetrySanitize(telemetry?: TelemetryData): TelemetryData {
    return telemetry ? telemetry : {};
}

function newSdkInstance(
    config: IAnalyticalBackendConfig,
    implConfig: BearBackendConfig & FactoryFunction,
    telemetry: TelemetryData,
): SDK {
    const sdk = implConfig.factory ? implConfig.factory() : createSdk();

    if (config.hostname) {
        sdk.config.setCustomDomain(config.hostname);
    }

    if (implConfig.packageName && implConfig.packageVersion) {
        sdk.config.setJsPackage(implConfig.packageName, implConfig.packageVersion);
    } else {
        sdk.config.setJsPackage(packageJson.name, packageJson.version);
    }

    if (telemetry.componentName) {
        sdk.config.setRequestHeader("X-GDC-JS-SDK-COMP", telemetry.componentName);

        if (telemetry.props && !isEmpty(telemetry.props)) {
            sdk.config.setRequestHeader("X-GDC-JS-SDK-COMP-PROPS", telemetry.props.join(","));
        }
    }

    return sdk;
}
