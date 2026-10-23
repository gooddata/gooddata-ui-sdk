// (C) 2022-2026 GoodData Corporation

import { type Context, useContext, useMemo } from "react";

import { type ValidationError } from "yup";

import { FormContext, type FormContextState } from "./FormContext.js";

export function useFormErrors<T>(field?: keyof T): ValidationError[] {
    const { formStatus, changedValues, touchedValues } = useContext(
        FormContext as unknown as Context<FormContextState<T, unknown>>,
    );
    const { validation } = formStatus || {};
    const { errors } = validation || {};

    // Touched as well as changed: leaving a field the user never typed in still has to show
    // why it is invalid, without marking it edited.
    const seen = (field && (touchedValues[field] || changedValues[field])) || false;

    return useMemo(() => {
        const errs = errors || [];
        if (field) {
            return seen ? errs.filter((err: ValidationError) => err.path === field.toString()) : [];
        }
        return errs.slice();
    }, [errors, field, seen]);
}
