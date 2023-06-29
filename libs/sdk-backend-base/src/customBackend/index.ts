// (C) 2019-2023 GoodData Corporation

import {
    IAuthenticatedPrincipal,
    IAuthenticationContext,
    IBackendCapabilities,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    IAuthenticationProvider,
    isNotAuthenticated,
    IUserService,
    IWorkspacesQueryFactory,
    NotAuthenticated,
    NotSupported,
    IOrganization,
    IOrganizations,
    IEntitlements,
} from "@gooddata/sdk-backend-spi";
import { TelemetryData } from "../toolkit/backend.js";
import {
    AnonymousAuthProvider,
    AuthenticatedAsyncCall,
    AuthProviderCallGuard,
    IAuthenticatedAsyncCallContext,
    IAuthProviderCallGuard,
} from "../toolkit/auth.js";
import { CustomWorkspace } from "./workspace.js";
import { CustomBackendConfig } from "./config.js";

//
//
//

/**
 * @internal
 */
export class CustomBackend implements IAnalyticalBackend {
    public readonly capabilities: IBackendCapabilities;
    public readonly config: CustomBackendConfig;

    private readonly authProvider: IAuthProviderCallGuard;

    constructor(
        config: CustomBackendConfig,
        authProvider?: IAuthProviderCallGuard,
        private readonly telemetryData?: TelemetryData,
    ) {
        this.config = config;
        this.capabilities = {};

        this.authProvider = authProvider || new AnonymousAuthProvider();
    }

    public onHostname = (hostname: string): IAnalyticalBackend => {
        const newConfig: CustomBackendConfig = {
            ...this.config,
            hostname,
        };

        return new CustomBackend(newConfig);
    };

    public withAuthentication = (provider: IAuthenticationProvider): IAnalyticalBackend => {
        const guardedAuthProvider = new AuthProviderCallGuard(provider);

        return new CustomBackend(this.config, guardedAuthProvider);
    };

    public authenticate = (force?: boolean): Promise<IAuthenticatedPrincipal> => {
        if (!this.authProvider) {
            return Promise.reject(
                new NotAuthenticated("Backend is not set up with authentication provider."),
            );
        }

        if (force) {
            this.authProvider.reset();
        }

        return this.authProvider.authenticate(this.getAuthenticationContext());
    };

    public deauthenticate = (): Promise<void> => {
        return this.authProvider.deauthenticate(this.getAuthenticationContext());
    };

    public isAuthenticated = (): Promise<IAuthenticatedPrincipal | null> => {
        return this.authProvider.getCurrentPrincipal(this.getAuthenticationContext());
    };

    public withTelemetry = (componentName: string, props: object): IAnalyticalBackend => {
        return new CustomBackend(this.config, this.authProvider, {
            componentName,
            props: Object.keys(props),
        });
    };

    public workspace = (id: string): IAnalyticalWorkspace => {
        return new CustomWorkspace(id, this.config, {
            telemetry: this.telemetryData,
            authApiCall: this.authApiCall,
        });
    };

    public workspaces = (): IWorkspacesQueryFactory => {
        throw new NotSupported("workspace listing is not supported");
    };

    public currentUser = (): IUserService => {
        throw new NotSupported("user service is not supported");
    };

    public organization = (_organizationId: string): IOrganization => {
        throw new NotSupported("organization is not supported");
    };

    public organizations = (): IOrganizations => {
        throw new NotSupported("organizations is not supported");
    };

    public entitlements = (): IEntitlements => {
        throw new NotSupported("entitlements are not supported");
    };

    private getAuthenticationContext = (useClient?: any): IAuthenticationContext => {
        return {
            client: useClient || this.config.clientProvider(this.config),
            backend: this,
        };
    };

    private authApiCall = async <T>(call: AuthenticatedAsyncCall<any, T>): Promise<T> => {
        // first, try it "normally"
        let result: T;
        const client = this.config.clientProvider(this.config);

        try {
            result = await call(client, await this.getAsyncCallContext(client));
        } catch (err) {
            if (!isNotAuthenticated(err)) {
                throw err;
            }

            // in case there was a NotAuthenticated error, trigger auth and try once again
            try {
                await this.triggerAuthentication(true, client);
                result = await call(client, await this.getAsyncCallContext(client));
            } catch (err) {
                if (!isNotAuthenticated(err)) {
                    throw err;
                }

                throw new NotAuthenticated("Current session is not authenticated.", err);
            }
        }

        return result;
    };

    private triggerAuthentication = (reset = false, useClient?: any): Promise<IAuthenticatedPrincipal> => {
        if (!this.authProvider) {
            return Promise.reject(
                new NotAuthenticated("Backend is not set up with authentication provider."),
            );
        }

        if (reset) {
            this.authProvider.reset();
        }

        return this.authProvider.authenticate(this.getAuthenticationContext(useClient));
    };

    private getAsyncCallContext = async (client: any): Promise<IAuthenticatedAsyncCallContext> => {
        const getPrincipal = async (): Promise<IAuthenticatedPrincipal> => {
            if (!this.authProvider) {
                throw new NotAuthenticated("Cannot obtain principal without an authProvider.");
            }

            const principal = await this.authProvider.getCurrentPrincipal({ client, backend: this });
            if (principal) {
                return principal;
            }

            return this.authProvider.authenticate(this.getAuthenticationContext(client));
        };

        return {
            getPrincipal,
        };
    };
}

//
//
//

/**
 * Creates an instance of backend which uses custom functions to calculate results. See {@link CustomBackendConfig}
 * to learn more on what and how should be customized.
 *
 * ---
 *
 * Authentication is handled according to the specification described in the IAnalyticalBackend SPI. The custom backend
 * can be set up with authentication provider which will realize the desired authentication mechanism.
 *
 * Unless explicitly told via forced authentication (see {@link IAnalyticalBackend#authenticate}), the custom backend
 * will defer authentication until it is actually needed. In order for the custom backend to recognize that authentication
 * is needed, the different providers must throw the `NotAuthenticated` error.
 *
 * @beta
 */
export function customBackend(config: CustomBackendConfig): IAnalyticalBackend {
    return new CustomBackend(config);
}
