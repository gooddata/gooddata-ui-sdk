// (C) 2022-2026 GoodData Corporation

import { type Context, useContext } from "react";

import { FormContext, type FormContextState } from "./FormContext.js";

export function useFormDefaults<T>(): T {
    const { defaultValues } = useContext(FormContext as unknown as Context<FormContextState<T, unknown>>);
    return defaultValues;
}
