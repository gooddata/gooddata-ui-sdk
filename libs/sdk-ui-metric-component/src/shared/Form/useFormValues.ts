// (C) 2022-2026 GoodData Corporation

import { type Context, useCallback, useContext } from "react";

import { FormContext, type FormContextState } from "./FormContext.js";

export function useFormValues<T>(): T {
    const { currentValues } = useContext(FormContext as unknown as Context<FormContextState<T, unknown>>);
    return currentValues;
}

export function useFormValuesGetter<T>(): () => T {
    const { getFormState } = useContext(FormContext as unknown as Context<FormContextState<T, unknown>>);
    return useCallback(() => getFormState().currentValues, [getFormState]);
}
