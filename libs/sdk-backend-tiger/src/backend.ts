// (C) 2019 GoodData Corporation
import {
    AnalyticalBackendConfig,
    BackendCapabilities,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
} from "@gooddata/sdk-backend-spi";
import { AxiosInstance } from "axios";
import { newAxios } from "./gd-tiger-client/axios";
import { TigerWorkspace } from "./workspace";
import isEmpty = require("lodash/isEmpty");

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
export class TigerBackend implements IAnalyticalBackend {
    public readonly capabilities: BackendCapabilities = CAPABILITIES;
    public readonly config: AnalyticalBackendConfig;

    private readonly telemetry: TelemetryData;
    private readonly implConfig: any;
    private readonly axios: AxiosInstance;

    constructor(
        config?: AnalyticalBackendConfig,
        implConfig?: TigerBackendConfig,
        telemetry?: TelemetryData,
    ) {
        this.config = configSanitize(config);
        this.implConfig = tigerConfigSanitize(implConfig);
        this.telemetry = telemetrySanitize(telemetry);
        this.axios = createAxios(this.config, this.implConfig, this.telemetry);
    }

    public onHostname(hostname: string): IAnalyticalBackend {
        return new TigerBackend({ ...this.config, hostname }, this.implConfig, this.telemetry);
    }

    public withCredentials(_username: string, _password: string): IAnalyticalBackend {
        // TODO: no auth for tiger yet
        return this;
    }

    public withTelemetry(componentName: string, props: object): IAnalyticalBackend {
        return new TigerBackend(this.config, this.implConfig, { componentName, props: Object.keys(props) });
    }

    public isAuthenticated(): Promise<boolean> {
        return new Promise(resolve => {
            resolve(true);
        });
    }

    public workspace(id: string): IAnalyticalWorkspace {
        return new TigerWorkspace(this.axios, id);
    }
}

function configSanitize(config?: AnalyticalBackendConfig): AnalyticalBackendConfig {
    return config ? config : {};
}

function tigerConfigSanitize(implConfig?: TigerBackendConfig): TigerBackendConfig {
    return implConfig ? implConfig : {};
}

function telemetrySanitize(telemetry?: TelemetryData): TelemetryData {
    return telemetry ? telemetry : {};
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
