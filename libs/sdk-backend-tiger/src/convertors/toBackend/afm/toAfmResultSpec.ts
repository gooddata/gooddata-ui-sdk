// (C) 2007-2025 GoodData Corporation
import { AFM, AfmExecution, AttributeItem, MeasureItem, ResultSpec } from "@gooddata/api-client-tiger";
import { IExecutionDefinition } from "@gooddata/sdk-model";

import { convertAfmFilters } from "./AfmFiltersConverter.js";
import { convertAttribute } from "./AttributeConverter.js";
import { convertDimensions } from "./DimensionsConverter.js";
import { convertMeasure } from "./MeasureConverter.js";
import { convertTotals } from "./TotalsConverter.js";

function convertAFM(def: IExecutionDefinition): AFM {
    const attributes: AttributeItem[] = def.attributes.map(convertAttribute);
    const attrProp = { attributes };

    const measures: MeasureItem[] = def.measures.map(convertMeasure);
    const measuresProp = { measures };

    const { filters, auxMeasures } = convertAfmFilters(def.measures, def.filters || []);
    const filtersProp = { filters };
    const auxMeasuresProp = { auxMeasures };

    return {
        ...measuresProp,
        ...attrProp,
        ...filtersProp,
        ...auxMeasuresProp,
    };
}

function convertResultSpec(def: IExecutionDefinition): ResultSpec {
    return {
        dimensions: convertDimensions(def),
        totals: convertTotals(def),
    };
}

/**
 * Converts execution definition to AFM Execution
 *
 * @param def - execution definition
 * @returns AFM Execution
 *
 * @public
 */
export function toAfmExecution(def: IExecutionDefinition): AfmExecution {
    return {
        resultSpec: convertResultSpec(def),
        execution: {
            ...convertAFM(def),
        },
        settings: {
            ...def.executionConfig,
        },
    };
}
