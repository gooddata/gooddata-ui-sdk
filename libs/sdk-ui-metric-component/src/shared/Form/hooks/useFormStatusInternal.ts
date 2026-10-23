// (C) 2022-2026 GoodData Corporation

import { useMemo } from "react";

import { type ValidationError } from "yup";

import { FormMode } from "../data.js";
import { type IForm } from "../Form.js";
import { type FormState } from "../FormContext.js";
import { isChanged } from "../utils.js";

import { type FormHandlers } from "./useFormHandlersInternal.js";

export type FormStatus<T, S> = {
    mode: FormMode;
    //permissions
    isWriteable: boolean;
    isEditable: boolean;
    isReadOnly: boolean;
    //validation
    isError: boolean;
    isValid: boolean;
    validation: ValidationInfo<T, S>;
    //form state
    isLocked: boolean;
    isDirty: boolean;
    isLoading: boolean;
    isSaving: boolean;
    isSaveAsDisabled: boolean;
    isSaveDisabled: boolean;
    submitCount: number;
};

export type ValidationInfo<T, S> = {
    loading: boolean;
    errors: ValidationError[];
    critical: ValidationError[];
    fields: { [key in keyof Partial<T>]: string };
    specials: S;
};

export function useFormStatusInternal<T, S>(
    handlers: FormHandlers<T, S>,
    props: IForm<T, S>,
    state: FormState<T>,
): FormStatus<T, S> {
    return useStatus(handlers, props, state);
}

function useStatus<T, S>(
    { transformer, validator }: FormHandlers<T, S>,
    { writeable = true, editable = true, locked = false, mode = FormMode.New }: IForm<T, S>,
    { defaultValues, currentValues, isSaving, submitCount }: FormState<T>,
): FormStatus<T, S> {
    const isDirty = isChanged(defaultValues, currentValues, transformer);
    const validation = useMemo(() => validator(currentValues), [currentValues, validator]);
    const isEditable = !locked && editable;
    const isReadOnly = !isEditable;

    const isError = validation.errors.length > 0;
    const isValid = !isError;
    const isLoading = isSaving || validation.loading;

    const isSaveAsDisabled = isError || isLoading;
    const isSaveDisabled = isSaveAsDisabled || (!isDirty && mode !== FormMode.New);

    return {
        mode,
        isWriteable: writeable,
        isEditable,
        isReadOnly,
        isError,
        isValid,
        validation,
        isLocked: locked,
        isDirty,
        isLoading,
        isSaving,
        isSaveAsDisabled,
        isSaveDisabled,
        submitCount,
    };
}
