// (C) 2022-2026 GoodData Corporation

import { type RefObject, createContext } from "react";

import { type FormHandlers } from "./hooks/useFormHandlersInternal.js";
import { type FormStatus, type ValidationInfo } from "./hooks/useFormStatusInternal.js";

export type FormState<T> = {
    defaultValues: Readonly<T>;
    currentValues: T;
    changedValues: { [key in keyof Partial<T>]: boolean };
    touchedValues: { [key in keyof Partial<T>]: boolean };
    elements: { [key in keyof Partial<T>]: RefObject<HTMLElement | null> };
    active: keyof Partial<T> | null;
    initialFocus: {
        field: keyof Partial<T> | null;
        focused: boolean;
    };
    //checks
    isSaving: boolean;
    submitCount: number;
};

export type FormStatusWrapper<T, S> = {
    formStatus: FormStatus<T, S> | null;
};

export type FormHandlersWrapper<T, S> = {
    formHandlers: FormHandlers<T, S>;
};

export type FormMutations<T> = {
    setValues: (props: Partial<T>) => void;
    setChanged: (props: { [key in keyof Partial<T>]: boolean }) => void;
    setTouched: (props: { [key in keyof Partial<T>]: boolean }) => void;
    setActive: (field: keyof Partial<T> | null) => void;
    setFocus: (field: keyof Partial<T> | null) => void;
    setBlur: (field: keyof Partial<T> | null) => void;
    setSaving: (state: boolean) => void;
};

export const DefaultState: FormState<unknown> = {
    active: null,
    initialFocus: { field: null, focused: false },
    defaultValues: {},
    currentValues: {},
    changedValues: {},
    touchedValues: {},
    elements: {},
    isSaving: false,
    submitCount: 0,
};

export const DefaultStatus: FormStatusWrapper<unknown, unknown> = {
    formStatus: null,
};

export const DefaultHandlers: FormHandlersWrapper<unknown, unknown> = {
    formHandlers: {
        onClose: () => {},
        onSave: () => Promise.resolve(),
        onSaveAs: () => Promise.resolve(),
        transformer: emptyTransformer,
        validator: emptyValidator,
    },
};

export type FormContextState<T, S> = FormState<T> & {
    getFormState: () => FormState<T>;
} & FormStatusWrapper<T, S> &
    FormMutations<T> &
    FormHandlersWrapper<T, S>;

export const FormContext = createContext<FormContextState<unknown, unknown>>({
    getFormState: () => DefaultState,
    ...DefaultState,
    ...DefaultStatus,
    ...DefaultHandlers,
    setValues: () => {},
    setChanged: () => {},
    setTouched: () => {},
    setActive: () => {},
    setFocus: () => {},
    setBlur: () => {},
    setSaving: () => {},
});

export function emptyTransformer<T>(data: T): T {
    return data;
}

export function emptyValidator<T, S>(): ValidationInfo<T, S> {
    return {
        loading: false,
        errors: [],
        critical: [],
        fields: {} as { [key in keyof Partial<T>]: string },
        specials: {} as S,
    };
}
