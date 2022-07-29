// (C) 2022 GoodData Corporation
import { IAnalyticalBackendConfig, IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import tigerFactory from "@gooddata/sdk-backend-tiger";

/**
 * A factory to create a new instance of the Tiger backend.
 *
 * @public
 */
export default (config?: IAnalyticalBackendConfig, implConfig?: any): IAnalyticalBackend =>
    tigerFactory(config, {
        ...implConfig,
        packageName: NPM_PACKAGE_NAME,
        packageVersion: NPM_PACKAGE_VERSION,
    });

// Re-export Tiger backend, so it can be imported by user as a separate entry point
// This helps us with chunking and keeping the original entry point slim
export * from "@gooddata/sdk-backend-tiger";
