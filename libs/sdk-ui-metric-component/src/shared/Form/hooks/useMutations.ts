// (C) 2022-2026 GoodData Corporation

import { type Dispatch, type SetStateAction, useCallback } from "react";

import { type FormMutations, type FormState } from "../FormContext.js";

export function useMutations<T>(setState: Dispatch<SetStateAction<FormState<T>>>): FormMutations<T> {
    const setValues: FormMutations<T>["setValues"] = useCallback(
        (props) => {
            setState((state) => {
                return {
                    ...state,
                    currentValues: {
                        ...state.currentValues,
                        ...props,
                    },
                };
            });
        },
        [setState],
    );

    const setChanged: FormMutations<T>["setChanged"] = useCallback(
        (props) => {
            setState((state) => {
                return {
                    ...state,
                    changedValues: {
                        ...state.changedValues,
                        ...props,
                    },
                };
            });
        },
        [setState],
    );

    const setTouched: FormMutations<T>["setTouched"] = useCallback(
        (props) => {
            setState((state) => {
                return {
                    ...state,
                    touchedValues: {
                        ...state.touchedValues,
                        ...props,
                    },
                };
            });
        },
        [setState],
    );

    const setActive: FormMutations<T>["setActive"] = useCallback(
        (active) => {
            setState((state) => {
                return {
                    ...state,
                    active,
                };
            });
        },
        [setState],
    );

    const setSaving: FormMutations<T>["setSaving"] = useCallback(
        (isSaving) => {
            setState((state) => {
                return {
                    ...state,
                    isSaving,
                    ...(isSaving
                        ? {
                              submitCount: state.submitCount + 1,
                          }
                        : {}),
                };
            });
        },
        [setState],
    );

    const setFocus: FormMutations<T>["setFocus"] = useCallback(
        (field) => {
            setState((state) => {
                //same field, do nothing
                if (state.initialFocus.field === field) {
                    return state;
                }
                return {
                    ...state,
                    initialFocus: {
                        field,
                        focused: false,
                    },
                };
            });
        },
        [setState],
    );

    const setBlur: FormMutations<T>["setBlur"] = useCallback(
        (field) => {
            setState((state) => {
                //same field, do nothing
                if (state.initialFocus.field !== field) {
                    return state;
                }
                return {
                    ...state,
                    initialFocus: {
                        field: null,
                        focused: false,
                    },
                };
            });
        },
        [setState],
    );

    return {
        setValues,
        setChanged,
        setTouched,
        setActive,
        setFocus,
        setBlur,
        setSaving,
    };
}
