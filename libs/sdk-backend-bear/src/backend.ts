// (C) 2019-2020 GoodData Corporation
import { factory as createSdk, SDK } from "@gooddata/gd-bear-client";
import {
    AnalyticalBackendConfig,
    AuthenticatedPrincipal,
    AuthenticationContext,
    BackendCapabilities,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    IAuthenticationProvider,
    NotAuthenticated,
    IWorkspaceQueryFactory,
    IUserService,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import { IInsight } from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import { AsyncCall, ErrorConverter, IAsyncCallContext } from "./commonTypes";
import { convertApiError, isApiResponseError } from "./errorHandling";
import { BearWorkspace } from "./workspace";
import defaultTo = require("lodash/defaultTo");
import isEmpty = require("lodash/isEmpty");
import { BearWorkspaceQueryFactory } from "./workspaces";
import { convertInsight } from "./fromSdkModel/InsightConverter";
import { GdcUser } from "@gooddata/gd-bear-model";
import { BearUserService } from "./user";

const CAPABILITIES: BackendCapabilities = {
    canCalculateTotals: true,
    canExportCsv: true,
    canExportXlsx: true,
    canSortData: true,
    canTransformExistingResult: false,
    maxDimensions: 2,
    supportsElementUris: true,
    supportsObjectUris: true,
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
 */
type BearLegacyFunctions = {
    openAsReport?(workspace: string, insight: IInsight): Promise<string>;
    getBootstrapResource?(options: {
        projectId?: string;
        productId?: string;
        clientId?: string;
    }): Promise<GdcUser.IBootstrapResource>;
};

/**
 * Provides a way for the BearBackend to expose some of its backend specific functions.
 */
type LegacyFunctionsSubscription = {
    onLegacyFunctionsReady?(functions: BearLegacyFunctions): void;
};

type TelemetryData = {
    componentName?: string;
    props?: string[];
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
 *   someone calls withTelemetry on this instance => in that case there is no need to re-initiate login.
 *
 */
export class BearBackend implements IAnalyticalBackend {
    public readonly capabilities: BackendCapabilities = CAPABILITIES;
    public readonly config: AnalyticalBackendConfig;

    private readonly telemetry: TelemetryData;
    private readonly implConfig: any;
    private readonly authProvider: IAuthProviderCallGuard;
    private readonly sdk: SDK;

    constructor(
        config?: AnalyticalBackendConfig,
        implConfig?: BearBackendConfig & LegacyFunctionsSubscription,
        telemetry?: TelemetryData,
        authProvider?: IAuthProviderCallGuard,
    ) {
        this.config = configSanitize(config);
        this.implConfig = bearConfigSanitize(implConfig);
        this.telemetry = telemetrySanitize(telemetry);
        this.authProvider = authProvider || new NoopAuthProvider();
        this.sdk = newSdkInstance(this.config, this.implConfig, this.telemetry);

        if (this.implConfig.onLegacyCallbacksReady) {
            const legacyFunctions: BearLegacyFunctions = {
                openAsReport: (workspace: string, insight: IInsight) => {
                    const visualizationObject = convertInsight(insight);
                    return this.authApiCall(sdk =>
                        sdk.md.openVisualizationAsReport(workspace, { visualizationObject }),
                    );
                },
                getBootstrapResource: (options: {
                    projectId?: string;
                    productId?: string;
                    clientId?: string;
                }) => {
                    return this.authApiCall(sdk => sdk.user.getBootstrapResource(options));
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
            this.implConfig,
            { componentName, props: Object.keys(props) },
            this.authProvider,
        );
    }

    public withAuthentication(provider: IAuthenticationProvider): IAnalyticalBackend {
        const guardedAuthProvider = new AuthProviderCallGuard(provider);

        return new BearBackend(this.config, this.implConfig, this.telemetry, guardedAuthProvider);
    }

    public isAuthenticated(): Promise<AuthenticatedPrincipal | null> {
        return new Promise((resolve, reject) => {
            this.authProvider
                .getCurrentPrincipal({ client: this.sdk })
                .then(res => {
                    resolve(res);
                })
                .catch(err => {
                    if (isNotAuthenticatedError(err)) {
                        resolve(null);
                    }

                    reject(err);
                });
        });
    }

    public authenticate(force: boolean): Promise<AuthenticatedPrincipal> {
        if (!force) {
            return this.authApiCall(async sdk => {
                const principal = await this.authProvider.getCurrentPrincipal({ client: sdk });
                invariant(principal, "Principal must be defined");
                return principal!;
            });
        }

        return this.triggerAuthentication(true);
    }

    public deauthenticate(): Promise<void> {
        if (!this.authProvider) {
            throw new NotAuthenticated("Backend is not set up with authentication provider.");
        }
        return this.authProvider.deauthenticate(this.getAuthenticationContext());
    }

    public currentUser(): IUserService {
        return new BearUserService(this.authApiCall);
    }

    public workspace(id: string): IAnalyticalWorkspace {
        return new BearWorkspace(this.authApiCall, id);
    }

    public workspaces(): IWorkspaceQueryFactory {
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
        call: AsyncCall<T>,
        errorConverter: ErrorConverter = convertApiError,
    ): Promise<T> => {
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

    private getAuthenticationContext = (): AuthenticationContext => ({ client: this.sdk });

    private triggerAuthentication = (reset: boolean = false): Promise<AuthenticatedPrincipal> => {
        if (!this.authProvider) {
            return Promise.reject(
                new NotAuthenticated("Backend is not set up with authentication provider."),
            );
        }

        if (reset) {
            this.authProvider.reset();
        }

        return this.authProvider.authenticate(this.getAuthenticationContext());
    };

    private getAsyncCallContext = async (): Promise<IAsyncCallContext> => {
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
}

/**
 * This implementation of authentication provider does login with fixed username and password.
 *
 * @public
 */
export class FixedLoginAndPasswordAuthProvider implements IAuthenticationProvider {
    private principal: AuthenticatedPrincipal | undefined;

    constructor(private readonly username: string, private readonly password: string) {}

    public async authenticate(context: AuthenticationContext): Promise<AuthenticatedPrincipal> {
        const sdk = context.client as SDK;

        await sdk.user.login(this.username, this.password);
        await this.obtainCurrentPrincipal(context);

        invariant(this.principal, "Principal must be obtainable after login");

        return this.principal!;
    }

    public async getCurrentPrincipal(
        context: AuthenticationContext,
    ): Promise<AuthenticatedPrincipal | undefined> {
        if (!this.principal) {
            await this.obtainCurrentPrincipal(context);
        }

        return this.principal;
    }

    public async deauthenticate(context: AuthenticationContext): Promise<void> {
        const sdk = context.client as SDK;
        // we do not return the promise to logout as we do not want to return the response
        await sdk.user.logout();
    }

    private async obtainCurrentPrincipal(context: AuthenticationContext): Promise<void> {
        const sdk = context.client as SDK;
        const principal = await sdk.user.getCurrentProfile().then(currentProfileToPrincipalInformation);
        this.principal = principal;
    }
}

//
// internals
//

interface IAuthProviderCallGuard extends IAuthenticationProvider {
    reset(): void;
}

/**
 * This implementation of auth provider ensures, that the auth provider is called exactly once in the happy path
 * execution where provider successfully authenticates a principal.
 *
 * If underlying provider fails, subsequent calls that need authentication will land in the provider.
 *
 * This class encapsulates the stateful nature of interaction of the provider across multiple different instances
 * of the bear backend, all of which are set with the same provider. All instances of the backend should be
 * subject to the same authentication flow AND the call to the authentication provider should be synchronized
 * through this scoped instance.
 */
class AuthProviderCallGuard implements IAuthProviderCallGuard {
    private inflightRequest: Promise<AuthenticatedPrincipal> | undefined;
    private principal: AuthenticatedPrincipal | undefined;

    constructor(private readonly realProvider: IAuthenticationProvider) {}

    public reset = (): void => {
        this.principal = undefined;
    };

    public authenticate = (context: AuthenticationContext): Promise<AuthenticatedPrincipal> => {
        if (this.principal) {
            return Promise.resolve(this.principal);
        }

        if (this.inflightRequest) {
            return this.inflightRequest;
        }

        this.inflightRequest = this.realProvider
            .authenticate(context)
            .then(res => {
                this.principal = res;
                this.inflightRequest = undefined;

                return res;
            })
            .catch(err => {
                this.inflightRequest = undefined;

                throw err;
            });

        return this.inflightRequest;
    };

    public getCurrentPrincipal(context: AuthenticationContext): Promise<AuthenticatedPrincipal | undefined> {
        return this.realProvider.getCurrentPrincipal(context);
    }

    public async deauthenticate(context: AuthenticationContext): Promise<void> {
        return this.realProvider.deauthenticate(context);
    }
}

/**
 * This implementation serves as a Null object for IAuthProviderCallGuard.
 */
class NoopAuthProvider implements IAuthProviderCallGuard {
    public authenticate(_context: AuthenticationContext): Promise<AuthenticatedPrincipal> {
        throw new NotSupported("NoopAuthProvider does not support authenticate");
    }

    public getCurrentPrincipal(_context: AuthenticationContext): Promise<AuthenticatedPrincipal | undefined> {
        throw new NotSupported("NoopAuthProvider does not support getCurrentPrincipal");
    }

    public deauthenticate(_context: AuthenticationContext): Promise<void> {
        throw new NotSupported("NoopAuthProvider does not support deauthenticate");
    }

    public reset(): void {
        throw new NotSupported("NoopAuthProvider does not support reset");
    }
}

function isNotAuthenticatedError(err: any): boolean {
    return isApiResponseError(err) && err.response.status === 401;
}

function currentProfileToPrincipalInformation(obj: any): AuthenticatedPrincipal {
    return {
        userId: obj.login,
        userMeta: obj,
    };
}

function configSanitize(config?: AnalyticalBackendConfig): AnalyticalBackendConfig {
    return config ? config : {};
}

function bearConfigSanitize(implConfig?: BearBackendConfig): BearBackendConfig {
    return implConfig ? implConfig : {};
}

function telemetrySanitize(telemetry?: TelemetryData): TelemetryData {
    return telemetry ? telemetry : {};
}

function newSdkInstance(
    config: AnalyticalBackendConfig,
    implConfig: BearBackendConfig,
    telemetry: TelemetryData,
): SDK {
    const sdk = createSdk();

    if (config.hostname) {
        sdk.config.setCustomDomain(config.hostname);
    }

    if (implConfig.packageName && implConfig.packageVersion) {
        sdk.config.setJsPackage(implConfig.packageName, implConfig.packageVersion);
    }

    if (telemetry.componentName) {
        sdk.config.setRequestHeader("X-GDC-JS-SDK-COMP", telemetry.componentName);

        if (telemetry.props && !isEmpty(telemetry.props)) {
            sdk.config.setRequestHeader("X-GDC-JS-SDK-COMP-PROPS", telemetry.props.join(","));
        }
    }

    return sdk;
}
