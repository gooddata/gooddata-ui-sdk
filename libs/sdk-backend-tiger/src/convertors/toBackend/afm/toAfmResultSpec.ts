// (C) 2007-2020 GoodData Corporation
import compact = require("lodash/compact");
import isEmpty = require("lodash/isEmpty");
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { ExecuteAFM } from "@gooddata/api-client-tiger";
import { convertVisualizationObjectFilter } from "./FilterConverter";
import { convertMeasure } from "./MeasureConverter";
import { convertAttribute } from "./AttributeConverter";
import { convertDimensions } from "./DimensionsConverter";

function convertAFM(def: IExecutionDefinition): ExecuteAFM.IAfm {
    const attributes: ExecuteAFM.IAttribute[] = def.attributes.map(convertAttribute);
    const attrProp = { attributes };

    const measures: ExecuteAFM.IMeasure[] = def.measures.map(convertMeasure);
    const measuresProp = { measures };

    const filters: ExecuteAFM.CompatibilityFilter[] = def.filters
        ? compact(def.filters.map(convertVisualizationObjectFilter))
        : [];
    const filtersProp = { filters };

    return {
        ...measuresProp,
        ...attrProp,
        ...filtersProp,
    };
}

function convertResultSpec(def: IExecutionDefinition): ExecuteAFM.IResultSpec {
    const convertedDimensions = convertDimensions(def);
    const dimsProp = !isEmpty(convertedDimensions) ? { dimensions: convertedDimensions } : {};

    return {
        ...dimsProp,
    };
}
/**
 * Converts execution definition to AFM Execution
 *
 * @param def - execution definition
 * @returns AFM Execution
 */
export function toAfmExecution(def: IExecutionDefinition): ExecuteAFM.IExecution {
    return {
        project: def.workspace,
        resultSpec: convertResultSpec(def),
        execution: {
            ...convertAFM(def),
        },
    };
}
