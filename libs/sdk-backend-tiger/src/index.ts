// (C) 2019-2020 GoodData Corporation

import { AnalyticalBackendConfig } from "@gooddata/sdk-backend-spi";
import { TigerBackend } from "./backend";
import { TigerAnalyticalBackend, TigerUserMeta } from "./types";

/**
 * Returns function which creates instances of Analytical Backend implementation which works with the 'tiger'
 * version of the GoodData platform.
 *
 * @param config - analytical backend configuration, may be omitted and provided later
 * @param implConfig - tiger client specific configuration, may be omitted at this point but it cannot be provided later
 * @public
 */
function tigerFactory(config?: AnalyticalBackendConfig, implConfig?: any): TigerAnalyticalBackend {
    return new TigerBackend(config, implConfig);
}

export { TigerAnalyticalBackend, TigerUserMeta };

export default tigerFactory;
