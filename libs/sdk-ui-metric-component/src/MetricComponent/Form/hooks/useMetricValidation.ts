// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { ValidationError } from "yup";

import { type ValidationInfo } from "../../../shared/Form/hooks/useFormStatusInternal.js";
import { type IMeasureDef } from "../../metric/metricHelpers.js";
import { type ValidationSpecialInfo } from "../data.js";
import { type IMeasureDefWithMaqlField } from "../maqlFieldFunctions.js";

import { useValidationScheme } from "./useValidationScheme.js";

type MetricValidationInfo = ValidationInfo<IMeasureDef, ValidationSpecialInfo>;

export interface IMetricValidationOptions {
    allowEmptyCurrencyFormat?: boolean;
    validateCurrencyMetricType?: boolean;
}

export function useMetricValidation(
    locked: boolean,
    options: IMetricValidationOptions = {},
): (data: IMeasureDef) => MetricValidationInfo {
    const { metricSchema, loading } = useValidationScheme(locked, options);

    return useCallback(
        (data) => {
            if (loading) {
                return createMetricValidationInfo(true);
            }

            try {
                metricSchema.validateSync(data, { abortEarly: false });
                return createMetricValidationInfo(false);
            } catch (e) {
                if (ValidationError.isError(e)) {
                    const errors = e.inner;
                    const critical = e.inner.filter(filterWarnings);
                    const fields = loadFieldsErrors(e.inner);
                    return createMetricValidationInfo(
                        false,
                        { isMaqlEmpty: isMaqlEmpty(fields), isEmpty: isEmpty(fields) },
                        errors,
                        critical,
                        fields,
                    );
                }
                throw e;
            }
        },
        [loading, metricSchema],
    );
}

function createMetricValidationInfo(
    loading: boolean,
    specials: ValidationSpecialInfo = { isMaqlEmpty: false, isEmpty: false },
    errors: ValidationError[] = [],
    critical: ValidationError[] = [],
    fields: MetricValidationInfo["fields"] = {},
): MetricValidationInfo {
    return {
        loading,
        errors,
        critical,
        fields,
        specials,
    };
}

function isMaqlEmpty(fields: MetricValidationInfo["fields"]): boolean {
    return fields["expression"] === "empty";
}

function isEmpty(fields: MetricValidationInfo["fields"]): boolean {
    return isMaqlEmpty(fields) && Object.keys(fields).length === 1;
}

function loadFieldsErrors(errors: ValidationError[]) {
    return errors.reduce(
        (prev, item) => {
            if (item.path) {
                prev[item.path as keyof IMeasureDefWithMaqlField] = item.type;
            }
            return prev;
        },
        {} as MetricValidationInfo["fields"],
    );
}

function filterWarnings(item: ValidationError) {
    //NOTE: Empty maql is not a error but its bewhave as a warning
    const isEmptyMaql = item.path === "expression" && item.type === "empty";

    return !isEmptyMaql;
}
