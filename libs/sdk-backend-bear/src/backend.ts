// (C) 2019 GoodData Corporation
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
} from "@gooddata/sdk-backend-spi";
import { AsyncCall, isApiResponseError } from "./commonTypes";
import { BearWorkspace } from "./workspace";
import isEmpty = require("lodash/isEmpty");

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

type TelemetryData = {
    componentName?: string;
    props?: string[];
};

/**
 * This implementation of analytical backend uses the goodata-js API client to realize the SPI.
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
 *   someone calls withTelementry on this instance => in that case there is no need to reinitiate login.
 *
 */
export class BearBackend implements IAnalyticalBackend {
    public readonly capabilities: BackendCapabilities = CAPABILITIES;
    public readonly config: AnalyticalBackendConfig;

    private readonly telemetry: TelemetryData;
    private readonly implConfig: any;
    private readonly authProvider: AuthProviderCallGuard | undefined;
    private readonly sdk: SDK;

    constructor(
        config?: AnalyticalBackendConfig,
        implConfig?: BearBackendConfig,
        telemetry?: TelemetryData,
        authProvider?: AuthProviderCallGuard,
    ) {
        this.config = configSanitize(config);
        this.implConfig = bearConfigSanitize(implConfig);
        this.telemetry = telemetrySanitize(telemetry);
        this.authProvider = authProvider;
        this.sdk = newSdkInstance(this.config, this.implConfig, this.telemetry);
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
            this.sdk.user
                .getCurrentProfile()
                .then(res => {
                    resolve(currentProfileToPrincipalInformation(res));
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
            return this.authCall(sdk => {
                return sdk.user.getCurrentProfile().then(currentProfileToPrincipalInformation);
            });
        }

        return this.triggerAuthentication(true);
    }

    public workspace(id: string): IAnalyticalWorkspace {
        return new BearWorkspace(this.authCall, id);
    }

    /**
     * Perform API call that requires authentication; if the current session is not authenticated, then
     * call out to the provider to authenticate.
     *
     * @param call - a call which requires an authenticated session
     */
    public authCall = <T>(call: AsyncCall<T>): Promise<T> => {
        return call(this.sdk).catch(err => {
            if (!isNotAuthenticatedError(err)) {
                throw err;
            }

            return this.triggerAuthentication()
                .then(_ => {
                    return call(this.sdk);
                })
                .catch(err2 => {
                    throw new NotAuthenticated("Current session is not authenticated.", err2);
                });
        });
    };

    private triggerAuthentication = (reset: boolean = false): Promise<AuthenticatedPrincipal> => {
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

/**
 * This implementation of authentication provider does login with fixed username and password.
 *
 * @public
 */
export class FixedLoginAndPasswordAuthProvider implements IAuthenticationProvider {
    constructor(private readonly username: string, private readonly password: string) {}

    public async authenticate(context: AuthenticationContext): Promise<AuthenticatedPrincipal> {
        const sdk = context.client as SDK;

        await sdk.user.login(this.username, this.password);

        // retrieve full info about the authenticated user
        return sdk.user.getCurrentProfile().then(currentProfileToPrincipalInformation);
    }
}

//
// internals
//

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
class AuthProviderCallGuard implements IAuthenticationProvider {
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
}

function isNotAuthenticatedError(err: any): boolean {
    return isApiResponseError(err) && err.response === 401;
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
