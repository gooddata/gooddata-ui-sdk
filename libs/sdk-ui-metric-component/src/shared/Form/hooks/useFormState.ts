// (C) 2022-2026 GoodData Corporation

import { type Dispatch, type SetStateAction, useCallback, useEffect, useRef, useState } from "react";

import { DefaultState, type FormState } from "../FormContext.js";

export function useFormState<T>(
    data: T,
    initialFocus?: keyof T,
): [FormState<T>, Dispatch<SetStateAction<FormState<T>>>, () => FormState<T>] {
    const [state, setState] = useState<FormState<T>>({
        ...(DefaultState as FormState<T>),
        defaultValues: { ...data },
        currentValues: { ...data },
        initialFocus: {
            field: (initialFocus as keyof Partial<T>) || null,
            focused: false,
        },
    });

    const stateRef = useRef<FormState<T>>(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const getState = useCallback(() => stateRef.current, []);

    //reset occurred
    useEffect(() => {
        setState({
            ...(DefaultState as FormState<T>),
            defaultValues: { ...state.defaultValues },
            currentValues: { ...data },
            initialFocus: {
                field: (initialFocus as keyof Partial<T>) || null,
                focused: false,
            },
        });
        // oxlint-disable-next-line react-hooks/exhaustive-deps
    }, [initialFocus, data]);

    return [state, setState, getState];
}
