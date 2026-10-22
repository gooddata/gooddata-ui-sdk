// (C) 2026 GoodData Corporation

import { DataViewFacade, createNumberFormatter, formatAttributeHeaderValues } from "@gooddata/sdk-ui";

import { type IGeoAdapterContext } from "../registry/adapterTypes.js";

/**
 * Gives element values of attributes with a number format (numeric computed attributes) their formatted
 * name, so that location, segment, tooltip and legend texts derived from the data view show it.
 */
export function formatAttributeValues(dataView: DataViewFacade, context: IGeoAdapterContext): DataViewFacade {
    return DataViewFacade.for(
        formatAttributeHeaderValues(dataView.dataView, createNumberFormatter(context.config?.separators)),
    );
}
