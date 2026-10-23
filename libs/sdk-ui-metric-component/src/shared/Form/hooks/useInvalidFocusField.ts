// (C) 2022-2026 GoodData Corporation

import { type Context, useContext } from "react";

import { FormContext, type FormContextState } from "../FormContext.js";

import { type ValidationInfo } from "./useFormStatusInternal.js";

export function useInvalidFocusField<T, S>(
    invalidFocus?: (validation: ValidationInfo<T, S>) => keyof T | null,
): keyof T | null {
    const { formStatus } = useContext(FormContext as unknown as Context<FormContextState<T, S>>);
    const { validation } = formStatus || {};

    return invalidFocus && validation ? invalidFocus(validation) : null;
}
