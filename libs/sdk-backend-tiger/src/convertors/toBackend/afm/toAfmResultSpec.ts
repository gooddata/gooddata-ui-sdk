// (C) 2007-2026 GoodData Corporation

import { invariant } from "ts-invariant";

import {
    type AFM,
    type AfmExecution,
    type AttributeItem,
    type MeasureItem,
    type MetricDefinitionOverride,
    type ParameterItem,
    type ResultSpec,
} from "@gooddata/api-client-tiger";
import {
    type IExecutionDefinition,
    type IInsightParameterValue,
    type IMeasureDefinitionOverride,
} from "@gooddata/sdk-model";

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
    const { measureDefinitionOverrides, parameterValues, ...settings } = def.executionConfig ?? {};

    return {
        resultSpec: convertResultSpec(def),
        execution: {
            ...convertAFM(def),
            ...(measureDefinitionOverrides?.length && {
                measureDefinitionOverrides: convertMeasureDefinitionOverrides(measureDefinitionOverrides),
            }),
            ...(parameterValues?.length && {
                parameters: convertParameterValues(parameterValues),
            }),
        },
        settings,
    };
}

function convertMeasureDefinitionOverrides(
    overrides: IMeasureDefinitionOverride[],
): MetricDefinitionOverride[] {
    return overrides.map((override) => ({
        item: {
            identifier: {
                id: override.item.identifier.id,
                type: override.item.identifier.type,
            },
        },
        definition: {
            inline: {
                maql: override.definition.inline.maql,
            },
        },
    }));
}

function convertParameterValues(values: IInsightParameterValue[]): ParameterItem[] {
    return values.map((value) => {
        invariant(Number.isFinite(value.value), "Parameter value must be a finite number");

        return {
            parameter: {
                identifier: {
                    id: value.ref.identifier,
                    type: "parameter",
                },
            },
            value: String(value.value),
        };
    });
}
