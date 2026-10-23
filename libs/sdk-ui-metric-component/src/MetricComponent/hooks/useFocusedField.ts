// (C) 2021-2026 GoodData Corporation

import { useState } from "react";

import { isMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

import { FormField } from "../Form/data.js";
import { type IMeasureDef } from "../metric/metricHelpers.js";

export function useFocusedField(
    initialValueMetric: IMeasureDef,
    field?: FormField,
): [FormField, (field: FormField) => void] {
    const isDefinition = isMeasureMetadataObjectDefinition(initialValueMetric);
    const currentField = isDefinition ? FormField.title : FormField.expression;
    return useState<FormField>(field || currentField);
}
