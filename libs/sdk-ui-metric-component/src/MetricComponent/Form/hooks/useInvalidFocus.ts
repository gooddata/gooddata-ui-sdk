// (C) 2022-2026 GoodData Corporation

import { useCallback } from "react";

import { type ValidationInfo } from "../../../shared/Form/hooks/useFormStatusInternal.js";
import { type IMeasureDef } from "../../metric/metricHelpers.js";
import { FormField, type ValidationSpecialInfo } from "../data.js";

export function useInvalidFocus(): (
    validation: ValidationInfo<IMeasureDef, ValidationSpecialInfo>,
) => keyof IMeasureDef | null {
    return useCallback((validation) => {
        const { fields, specials } = validation;
        const { isMaqlEmpty } = specials || {};

        const invalidFields = Object.keys(fields);

        if (fields[FormField.expression] && !isMaqlEmpty) {
            return FormField.expression;
        }
        if (fields[FormField.title]) {
            return FormField.title;
        }
        if (invalidFields.length > 0) {
            return invalidFields[0] as FormField;
        }
        return null;
    }, []);
}
