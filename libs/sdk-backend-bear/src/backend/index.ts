// (C) 2019-2023 GoodData Corporation
import { getFactory as createSdk, SDK, CachingConfiguration, withCaching } from "@gooddata/api-client-bear";
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
    IEntitlements,
} from "@gooddata/sdk-backend-spi";
import { IInsight } from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import isEmpty from "lodash/isEmpty.js";
import isError from "lodash/isError.js";
import { convertApiError, isApiResponseError } from "../utils/errorHandling.js";
import { BearWorkspace } from "./workspace/index.js";
import { BearWorkspaceQueryFactory } from "./workspaces/index.js";
import { BearUserService } from "./user/index.js";
import { convertInsight } from "../convertors/toBackend/InsightConverter.js";

import {
    IBootstrapResource,
    IProfileSetting,
    IUISettings,
    IVisualization,
    IWrappedProjectDashboard,
    WrappedObject,
} from "@gooddata/api-model-bear";

import { sanitizeDrillingActivationPostMessageData } from "./drillingPostMessageData/index.js";
import {
    IAuthProviderCallGuard,
    NoopAuthProvider,
    AuthenticatedAsyncCall,
    IAuthenticatedAsyncCallContext,
    AuthProviderCallGuard,
    TelemetryData,
} from "@gooddata/sdk-backend-base";
import { IDrillableItemsCommandBody } from "@gooddata/sdk-embedding";
import { BearOrganization, BearOrganizations } from "./organization/index.js";
import { LIB_VERSION, LIB_NAME } from "../__version.js";
import { BearEntitlements } from "./entitlements/index.js";

const CAPABILITIES: IBackendCapabilities = {
    canCalculateGrandTotals: true,
    canCalculateSubTotals: true,
    canCalculateTotals: true,
    canCalculateNativeTotals: true,
    canExportCsv: true,
    canExportXlsx: true,
    canSortData: true,
    canTransformExistingResult: false,
    canWorkspaceManagerSeeEverySharedObject: false,
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
    supportsHierarchicalWorkspaces: false,
    supportsCustomColorPalettes: true,
    supportsOrganizationSettings: false,
    supportsInlineMeasures: false,
    supportsBootstrapResource: true,
    supportsMetadataObjectLocking: true,
    supportsGranularAccessControl: false,
    supportsEveryoneUserGroupForAccessControl: true,
    supportsNonProductionDatasets: true,
    supportsShowAllAttributeValues: false,
    supportsSeparateLatitudeLongitudeLabels: false,
    supportsEnumeratingDatetimeAttributes: true,
    supportsHiddenAndLockedFiltersOnUI: false,
    supportsAttributeHierarchies: false,
    supportsSettingConnectingAttributes: true,
    supportsKeepingDependentFiltersSelection: false,
    supportsCircularDependencyInFilters: false,
    allowMultipleInteractionsPerAttributeAndMeasure: false,
    supportsShowingFilteredElements: false,
    supportsSingleSelectDependentFilters: false,
    supportsCrossFiltering: false,
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
        loadAnalyticalDashboards?: boolean;
    }): Promise<IBootstrapResource>;
    ajaxSetup?(setup: any): void;
    log?(uri: string, logMessages: string[]): Promise<any>;
    updateProfileCurrentWorkspace?(workspace: string, profileSetting: IProfileSetting): Promise<void>;
    sanitizeDrillingActivationPostMessageData?(
        workspace: string,
        postMessageData: IDrillableItemsCommandBody,
    ): Promise<IDrillableItemsCommandBody>;
    getProjectDashboards?(workspace: string): Promise<IWrappedProjectDashboard[]>;
    getUrisFromIdentifiers?(
        workspace: string,
        identifiers: string[],
    ): Promise<{ uri: string; identifier: string }[]>;
    getObjectsByUri?(workspace: string, uris: string[]): Promise<WrappedObject[]>;
    getVisualizationObject?(workspace: string, uri: string): Promise<IVisualization>;
    getUISettings?(): Promise<{ settings: IUISettings }>;
};

/**
 * Provides a way for the BearBackend to expose some of its backend specific functions.
 */
type LegacyFunctionsSubscription = {
    /**
     * @deprecated Use onLegacyCallbacksReady instead
     * @param functions - backend specific functions to propagate
     */
    onLegacyFunctionsReady?(functions: BearLegacyFunctions): void;
    onLegacyCallbacksReady?(functions: BearLegacyFunctions): void;
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

type ClientCachingConfiguration = {
    cachingConfiguration?: CachingConfiguration;
};

type BearImplConfig = BearBackendConfig &
    LegacyFunctionsSubscription &
    FactoryFunction &
    LegacySetup &
    ClientCachingConfiguration;

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
    private readonly implConfig: BearImplConfig;
    private readonly authProvider: IAuthProviderCallGuard;
    private readonly sdk: SDK;

    // used to reconstruct and reapply the config when copying backend in withTelemetry and others
    private lastAjaxSetupSettings: any;

    constructor(
        config?: IAnalyticalBackendConfig,
        implConfig?: BearImplConfig,
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

                    const newProfileSetting: IProfileSetting = {
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
                        const [visObject] = await sdk.md.getObjects<IVisualization>(workspace, [uri]);

                        return visObject;
                    });
                },

                getUISettings: () => {
                    return this.sdk.xhr
                        .get("/gdc/account/organization/settings")
                        .then((response: any) => response.getData());
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
                return principal;
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

    public entitlements(): IEntitlements {
        return new BearEntitlements();
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
        try {
            // the return await is crucial here so that we also catch the async errors
            return await call(this.sdk, await this.getAsyncCallContext());
        } catch (err) {
            invariant(isError(err)); // if this bombs, the code in the try block threw something strange

            // if we receive some other error than missing auth, we fail fast: no need to try the auth
            // one more time, since it was not the problem in the first place
            if (!isNotAuthenticatedResponse(err)) {
                throw this.handleNotAuthenticated(errorConverter(err));
            }

            // else we try to trigger the authentication once more and then we repeat the original call
            // with the newly obtained async call context
            try {
                await this.triggerAuthentication();
                // the return await is crucial here so that we also catch the async errors
                return await call(this.sdk, await this.getAsyncCallContext());
            } catch (err2) {
                invariant(isError(err2)); // if this bombs, the code in the try block threw something strange
                throw this.handleNotAuthenticated(errorConverter(err2));
            }
        }
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
            throw this.handleNotAuthenticated(convertApiError(e));
        }
    };

    /**
     * Triggers onNotAuthenticated handler of the the authProvider if the provided error is an instance
     * of {@link @gooddata/sdk-backend-spi#NotAuthenticated}.
     *
     * @param err - error to observe and trigger handler for
     * @returns the original error to facilitate re-throwing
     */
    private handleNotAuthenticated = <T>(err: T): T => {
        if (isNotAuthenticated(err)) {
            this.authProvider.onNotAuthenticated?.({ client: this.sdk, backend: this }, err);
        }
        return err;
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

            return principal ?? this.authProvider.authenticate(this.getAuthenticationContext());
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
    return config ?? {};
}

function bearConfigSanitize(implConfig?: BearBackendConfig): BearBackendConfig {
    return implConfig ?? {};
}

function telemetrySanitize(telemetry?: TelemetryData): TelemetryData {
    return telemetry ?? {};
}

function newSdkInstance(
    config: IAnalyticalBackendConfig,
    implConfig: BearImplConfig,
    telemetry: TelemetryData,
): SDK {
    const sdk = implConfig.factory ? implConfig.factory() : createSdk();

    if (config.hostname) {
        sdk.config.setCustomDomain(config.hostname);
    }

    if (implConfig.packageName && implConfig.packageVersion) {
        sdk.config.setJsPackage(implConfig.packageName, implConfig.packageVersion);
    } else {
        sdk.config.setJsPackage(LIB_NAME, LIB_VERSION);
    }

    if (telemetry.componentName) {
        sdk.config.setRequestHeader("X-GDC-JS-SDK-COMP", telemetry.componentName);

        if (telemetry.props && !isEmpty(telemetry.props)) {
            sdk.config.setRequestHeader("X-GDC-JS-SDK-COMP-PROPS", telemetry.props.join(","));
        }
    }

    if (implConfig.cachingConfiguration) {
        return withCaching(sdk, {
            ...implConfig.cachingConfiguration,
        });
    }

    return sdk;
}
