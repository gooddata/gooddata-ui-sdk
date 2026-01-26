// (C) 2022-2026 GoodData Corporation

/* eslint-disable no-barrel-files/no-barrel-files */

import { type IAnalyticalBackend, type IAnalyticalBackendConfig } from "@gooddata/sdk-backend-spi";
import { tigerFactory } from "@gooddata/sdk-backend-tiger";

/**
 * A factory to create a new instance of the Tiger backend.
 *
 * @public
 */
export const tigerBackend = (config?: IAnalyticalBackendConfig, implConfig?: any): IAnalyticalBackend =>
    tigerFactory(config, {
        ...implConfig,
        packageName: NPM_PACKAGE_NAME,
        packageVersion: NPM_PACKAGE_VERSION,
    });

/**
 * @deprecated This will be removed in the next major release, please use the named export "tigerFactory" instead
 */
// eslint-disable-next-line no-restricted-exports
export default tigerBackend;

// Re-export Tiger backend, so it can be imported by user as a separate entry point
// This helps us with chunking and keeping the original entry point slim
// eslint-disable-next-line no-restricted-syntax
export * from "@gooddata/sdk-backend-tiger";
