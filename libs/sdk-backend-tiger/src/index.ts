// (C) 2019 GoodData Corporation

import { AnalyticalBackendConfig, IAnalyticalBackend, NotImplemented } from "@gooddata/sdk-backend-spi";

/**
 * Returns function which creates instances of Analytical Backend implementation which works with the 'tiger'
 * version of the GoodData platform.
 *
 * @param config - analytical backend configuration, may be omitted and provided later
 * @param implConfig - bear client specific configuration, may be omitted at this point but it cannot be provided later
 * @public
 */
// @ts-ignore
function tigerFactory(config?: AnalyticalBackendConfig, implConfig?: any): IAnalyticalBackend {
    throw new NotImplemented("...");
}

export default tigerFactory();
