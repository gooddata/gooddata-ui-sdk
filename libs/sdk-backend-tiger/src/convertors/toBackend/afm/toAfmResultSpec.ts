// (C) 2007-2020 GoodData Corporation
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { AFM, AfmExecution, AttributeItem, MeasureItem, ResultSpec } from "@gooddata/api-client-tiger";
import { convertMeasure } from "./MeasureConverter";
import { convertAttribute } from "./AttributeConverter";
import { convertDimensions } from "./DimensionsConverter";
import { convertAfmFilters } from "./AfmFiltersConverter";

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
    const convertedDimensions = convertDimensions(def);

    return { dimensions: convertedDimensions };
}
/**
 * Converts execution definition to AFM Execution
 *
 * @param def - execution definition
 * @returns AFM Execution
 */
export function toAfmExecution(def: IExecutionDefinition): AfmExecution {
    return {
        resultSpec: convertResultSpec(def),
        execution: {
            ...convertAFM(def),
        },
    };
}
