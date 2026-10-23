// (C) 2022-2026 GoodData Corporation

import { type Context, useContext } from "react";

import { FormContext, type FormContextState } from "./FormContext.js";
import { type FormStatus } from "./hooks/useFormStatusInternal.js";

export function useFormStatus<T, S>(): FormStatus<T, S> {
    const { formStatus } = useContext(FormContext as unknown as Context<FormContextState<T, S>>);

    if (!formStatus) {
        throw new Error(`Can not use form status without status set.`);
    }

    return formStatus;
}
