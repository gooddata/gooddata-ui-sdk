// (C) 2022-2026 GoodData Corporation

import { type ChangeEvent, type Context, type RefObject, useCallback, useContext } from "react";

import { type ValidationError } from "yup";

import { FormContext, type FormContextState } from "./FormContext.js";
import { useFormChanged } from "./useFormChanged.js";
import { useFormDirty } from "./useFormDirty.js";
import { useFormErrors } from "./useFormErrors.js";
import { useFormFieldElementRef } from "./useFormFieldElementRef.js";
import { useFormValues } from "./useFormValues.js";

export type FieldStatus<T, V> = {
    element: RefObject<HTMLElement | null>;
    field: keyof T;
    error: ValidationError | null;
    errors: ValidationError[];
    valid: boolean;
    value: V;
    dirty: boolean;
    changed: boolean;
    //handlers
    onFocus: (e?: FocusEvent) => void;
    onBlur: (e?: FocusEvent) => void;
    onChange: (value: V, e?: ChangeEvent) => void;
    setValue: (value: V) => void;
};

export type FieldProps<V> = {
    defaultValue?: V;
    onFocus?: (e?: FocusEvent) => void;
    onBlur?: (e?: FocusEvent) => void;
    onChange?: (value: V, e?: ChangeEvent) => void;
};

export function useFormField<V, T>(
    field: keyof T,
    { onBlur, onChange, onFocus, defaultValue }: FieldProps<V> = {},
): FieldStatus<T, V> {
    const { setValues, setChanged, setTouched, setActive, setBlur } = useContext(
        FormContext as unknown as Context<FormContextState<T, unknown>>,
    );
    const errors = useFormErrors<T>(field);
    const values = useFormValues<T>();
    const dirty = useFormDirty<T>(field);
    const changed = useFormChanged<T>(field);
    const element = useFormFieldElementRef<T>(field);

    const onBlurHandler = useCallback(
        (e?: FocusEvent) => {
            setTouched({ [field]: true } as { [key in keyof Partial<T>]: boolean });
            setActive(null);
            setBlur(field);
            if (onBlur) {
                onBlur(e);
            }
        },
        [field, onBlur, setActive, setTouched, setBlur],
    );
    const onFocusHandler = useCallback(
        (e?: FocusEvent) => {
            setActive(field);
            if (onFocus) {
                onFocus(e);
            }
        },
        [field, onFocus, setActive],
    );
    const onChangeHandler = useCallback(
        (value: V, e?: ChangeEvent) => {
            setValues({ [field]: value } as Partial<T>);
            setChanged({ [field]: true } as { [key in keyof Partial<T>]: boolean });
            if (onChange) {
                onChange(value, e);
            }
        },
        [field, onChange, setChanged, setValues],
    );
    const setValueHandler = useCallback(
        (value: V) => {
            setValues({
                [field]: value,
            } as Partial<T>);
            if (onChange) {
                onChange(value);
            }
        },
        [field, onChange, setValues],
    );

    return {
        field,
        errors,
        dirty,
        changed,
        element,
        error: errors[0] || null,
        valid: errors.length === 0,
        value: (values[field] ?? defaultValue) as unknown as V,
        //handlers
        onFocus: onFocusHandler,
        onBlur: onBlurHandler,
        onChange: onChangeHandler,
        setValue: setValueHandler,
    };
}
