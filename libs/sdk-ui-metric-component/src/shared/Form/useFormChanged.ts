// (C) 2022-2026 GoodData Corporation

import { type Context, useContext, useMemo } from "react";

import { FormContext, type FormContextState } from "./FormContext.js";

export function useFormChanged<T>(field?: keyof T): boolean {
    const { changedValues } = useContext(FormContext as unknown as Context<FormContextState<T, unknown>>);

    return useMemo(() => {
        if (field) {
            return Boolean(changedValues[field]);
        }
        return Object.keys(changedValues).some((key) => Boolean(changedValues[key as keyof T]));
    }, [changedValues, field]);
}
