// (C) 2022-2026 GoodData Corporation

import { type Context, useContext, useMemo } from "react";

import { FormContext, type FormContextState } from "./FormContext.js";

export function useFormDirty<T>(field?: keyof T): boolean {
    const { currentValues, defaultValues, formStatus } = useContext(
        FormContext as unknown as Context<FormContextState<T, unknown>>,
    );
    const { isDirty = false } = formStatus || {};

    return useMemo(() => {
        if (field) {
            return currentValues[field] !== defaultValues[field];
        }
        return isDirty;
    }, [currentValues, defaultValues, field, isDirty]);
}
