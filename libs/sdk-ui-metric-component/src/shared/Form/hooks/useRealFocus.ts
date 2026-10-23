// (C) 2021-2026 GoodData Corporation

import { type Dispatch, type MutableRefObject, type SetStateAction, useEffect, useRef } from "react";

import { type FormState } from "../FormContext.js";

import { type FormStatus } from "./useFormStatusInternal.js";

export function useRealFocus<T>(
    { isReadOnly }: FormStatus<T, unknown>,
    state: FormState<T>,
    setState: Dispatch<SetStateAction<FormState<T>>>,
): void {
    const { initialFocus, elements } = state;
    const { field, focused } = initialFocus;
    const element = (field && elements[field]) ?? null;
    const ref = useRef(-1);

    useEffect(() => {
        if (field && !focused && !isReadOnly) {
            tryFocus(field, element, setState, ref);
        }
        // oxlint-disable-next-line react-hooks/exhaustive-deps
        return () => window.clearTimeout(ref.current);
    }, [element, field, focused, setState, isReadOnly]);
}

function tryFocus<T>(
    field: keyof Partial<T>,
    element: MutableRefObject<HTMLElement | null> | null,
    setState: Dispatch<SetStateAction<FormState<T>>>,
    ref: MutableRefObject<number>,
) {
    window.clearTimeout(ref.current);

    if (element && focus(field, element, setState)) {
        return;
    }

    ref.current = window.setTimeout(() => tryFocus(field, element, setState, ref), 20);
}

function focus<T>(
    _field: keyof Partial<T>,
    element: MutableRefObject<HTMLElement | null>,
    setState: Dispatch<SetStateAction<FormState<T>>>,
) {
    if (element.current) {
        element.current.focus();
        setState((state) => {
            return {
                ...state,
                initialFocus: {
                    ...state.initialFocus,
                    focused: true,
                },
            };
        });
        return true;
    }
    return false;
}
