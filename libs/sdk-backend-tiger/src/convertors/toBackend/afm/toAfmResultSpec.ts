// (C) 2007-2020 GoodData Corporation
import compact from "lodash/compact";
import { IExecutionDefinition } from "@gooddata/sdk-model";
import {
    AFM,
    AfmExecution,
    AttributeItem,
    FilterDefinition,
    MeasureItem,
    ResultSpec,
} from "@gooddata/api-client-tiger";
import { convertFilter } from "./FilterConverter";
import { convertMeasure } from "./MeasureConverter";
import { convertAttribute } from "./AttributeConverter";
import { convertDimensions } from "./DimensionsConverter";

function convertAFM(def: IExecutionDefinition): AFM {
    const attributes: AttributeItem[] = def.attributes.map(convertAttribute);
    const attrProp = { attributes };

    const measures: MeasureItem[] = def.measures.map(convertMeasure);
    const measuresProp = { measures };

    const filters: FilterDefinition[] = def.filters ? compact(def.filters.map(convertFilter)) : [];
    const filtersProp = { filters };

    return {
        ...measuresProp,
        ...attrProp,
        ...filtersProp,
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
