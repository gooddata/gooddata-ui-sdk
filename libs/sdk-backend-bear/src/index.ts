// (C) 2019-2020 GoodData Corporation

import { AnalyticalBackendConfig, IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { BearBackend, BearBackendConfig } from "./backend";
import { FixedLoginAndPasswordAuthProvider, ContextDeferredAuthProvider, BearAuthProviderBase } from "./auth";

/**
 * Returns function which creates instances of Analytical Backend implementation which works with the 'bear'
 * version of the GoodData platform.
 *
 * @param config - analytical backend configuration, may be omitted and provided later
 * @param implConfig - bear client specific configuration, may be omitted at this point but it cannot be provided later
 * @public
 */
function bearFactory(config?: AnalyticalBackendConfig, implConfig?: any): IAnalyticalBackend {
    return new BearBackend(config, implConfig);
}

export {
    BearBackendConfig,
    FixedLoginAndPasswordAuthProvider,
    ContextDeferredAuthProvider,
    BearAuthProviderBase,
};

export default bearFactory;

//
// Exports to support legacy state in AD
//

import { convertVisualization } from "./convertors/fromBackend/VisualizationConverter";

import { convertReferencesToUris } from "./convertors/fromBackend/ReferenceConverter";

import { convertInsight, convertInsightDefinition } from "./convertors/toBackend/InsightConverter";

import { toAfmExecution } from "./convertors/toBackend/afm/ExecutionConverter";

/**
 * Some of the convertors from and to bear types are exported through this so that they can be used by our
 * applications that were using bear-specific types in their state.
 *
 * All of these exports are marked as internal and can break at any time.
 *
 * @internal
 */
export const BearConvertors = {
    convertVisualization,
    convertReferencesToUris,
    convertInsight,
    convertInsightDefinition,
    toAfmExecution,
};
