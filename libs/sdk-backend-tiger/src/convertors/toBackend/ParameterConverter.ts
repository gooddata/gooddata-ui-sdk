// (C) 2026 GoodData Corporation

import type {
    DateRangeParameterValue,
    JsonApiParameterInAttributes,
    JsonApiParameterInAttributesDefinition,
    JsonApiParameterPatchAttributes,
    StringConstraints,
} from "@gooddata/api-client-tiger";
import {
    type IDateRangeParameterPeriod,
    type IParameterDefinition,
    type IParameterMetadataObjectDefinition,
    type IStringParameterConstraints,
    throwUnexpected,
} from "@gooddata/sdk-model";

import { toTigerDateRangeParameterGranularity } from "../shared/dateRangeParameterGranularity.js";

function convertParameterDefinitionToBackend(
    definition: IParameterDefinition,
): JsonApiParameterInAttributesDefinition {
    const { type } = definition;
    switch (type) {
        case "NUMBER":
            return {
                type: "NUMBER",
                defaultValue: definition.defaultValue,
                ...(definition.constraints === undefined ? {} : { constraints: definition.constraints }),
            };
        case "STRING":
            return {
                type: "STRING",
                defaultValue: definition.defaultValue,
                ...(definition.constraints === undefined
                    ? {}
                    : { constraints: convertStringConstraintsToBackend(definition.constraints) }),
            };
        case "DATE_RANGE":
            return {
                type: "DATE_RANGE",
                defaultValue: convertDateRangePeriodToBackend(definition.defaultValue),
            };
        default:
            return throwUnexpected(type);
    }
}

function convertDateRangePeriodToBackend({
    granularity,
    ...ends
}: IDateRangeParameterPeriod): DateRangeParameterValue {
    return { granularity: toTigerDateRangeParameterGranularity(granularity), ...ends };
}

function convertStringConstraintsToBackend(constraints: IStringParameterConstraints): StringConstraints {
    const { allowedValues, ...otherConstraints } = constraints;
    return {
        ...otherConstraints,
        ...(allowedValues && allowedValues.length > 0 ? { allowedValues } : {}),
    };
}

export function convertParameterToBackendCreate(
    parameter: IParameterMetadataObjectDefinition,
): JsonApiParameterInAttributes {
    return {
        title: parameter.title,
        description: parameter.description,
        tags: parameter.tags,
        definition: convertParameterDefinitionToBackend(parameter.definition),
    };
}

export function convertParameterToBackendUpdate(
    parameter: Partial<IParameterMetadataObjectDefinition>,
): JsonApiParameterPatchAttributes {
    return {
        ...(parameter.title === undefined ? {} : { title: parameter.title }),
        ...(parameter.description === undefined ? {} : { description: parameter.description }),
        ...(parameter.tags === undefined ? {} : { tags: parameter.tags }),
        ...(parameter.definition === undefined
            ? {}
            : { definition: convertParameterDefinitionToBackend(parameter.definition) }),
    };
}
