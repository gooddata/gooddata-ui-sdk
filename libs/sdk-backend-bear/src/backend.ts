// (C) 2019 GoodData Corporation
import { factory as createSdk, SDK } from "@gooddata/gd-bear-client";
import {
    AnalyticalBackendConfig,
    BackendCapabilities,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    NotAuthenticated,
} from "@gooddata/sdk-backend-spi";
import isEmpty from "lodash/isEmpty";
import { AuthenticatedSdkProvider } from "./commonTypes";
import { BearWorkspace } from "./workspace";

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
    private readonly sdk: SDK;
    private readonly deferredAuth: Promise<any> | undefined;

    constructor(
        config?: AnalyticalBackendConfig,
        implConfig?: BearBackendConfig,
        telemetry?: TelemetryData,
        deferredAuth?: Promise<any>,
    ) {
        this.config = configSanitize(config);
        this.implConfig = bearConfigSanitize(implConfig);
        this.telemetry = telemetrySanitize(telemetry);

        this.sdk = newSdkInstance(this.config, this.implConfig, this.telemetry);
        this.deferredAuth = deferredAuth;
    }

    public onHostname(hostname: string): IAnalyticalBackend {
        return new BearBackend({ ...this.config, hostname }, this.implConfig, this.telemetry);
    }

    public withCredentials(username: string, password: string): IAnalyticalBackend {
        return new BearBackend(
            { ...this.config, username },
            this.implConfig,
            this.telemetry,
            this.sdk.user.login(username, password),
        );
    }

    public withTelemetry(componentName: string, props: object): IAnalyticalBackend {
        return new BearBackend(
            this.config,
            this.implConfig,
            { componentName, props: Object.keys(props) },
            this.deferredAuth,
        );
    }

    public isAuthenticated(): Promise<boolean> {
        if (!this.deferredAuth) {
            return new Promise(resolve => {
                resolve(false);
            });
        }

        return this.deferredAuth.then(_ => true).catch(_ => false);
    }

    public workspace(id: string): IAnalyticalWorkspace {
        if (!this.deferredAuth) {
            throw new NotAuthenticated("Backend is not set up with credentials.");
        }

        return new BearWorkspace(this.get, id);
    }

    public get: AuthenticatedSdkProvider = () => {
        if (!this.deferredAuth) {
            throw new NotAuthenticated("Backend is not set up with credentials.");
        }

        return this.deferredAuth
            .then(_ => {
                return this.sdk;
            })
            .catch(e => {
                const user = this.config.username ? this.config.username : "unknown";
                throw new NotAuthenticated(
                    `Authentication to hostname ${this.config.hostname} as user ${user} has failed`,
                    e,
                );
            });
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
