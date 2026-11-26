// (C) 2021-2026 GoodData Corporation

import { type Dispatch, type MutableRefObject, type SetStateAction, useEffect, useRef } from "react";

import { type IsFocusInTabList, useIsFocusInTabList } from "../../Tabs/tabListFocus.js";
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
    const isFocusInTabList = useIsFocusInTabList();

    useEffect(() => {
        if (field && !focused && !isReadOnly) {
            tryFocus(field, element, setState, ref, isFocusInTabList);
        }
        // oxlint-disable-next-line react-hooks/exhaustive-deps
        return () => window.clearTimeout(ref.current);
    }, [element, field, focused, setState, isReadOnly, isFocusInTabList]);
}

function tryFocus<T>(
    field: keyof Partial<T>,
    element: MutableRefObject<HTMLElement | null> | null,
    setState: Dispatch<SetStateAction<FormState<T>>>,
    ref: MutableRefObject<number>,
    isFocusInTabList: IsFocusInTabList,
) {
    window.clearTimeout(ref.current);

    if (element && focus(field, element, setState, isFocusInTabList)) {
        return;
    }

    ref.current = window.setTimeout(() => tryFocus(field, element, setState, ref, isFocusInTabList), 20);
}

function focus<T>(
    _field: keyof Partial<T>,
    element: MutableRefObject<HTMLElement | null>,
    setState: Dispatch<SetStateAction<FormState<T>>>,
    isFocusInTabList: IsFocusInTabList,
) {
    if (element.current) {
        // The form appeared because the user selected its tab in the tab list (an arrow key or a
        // click); the focus stays on the tab there, so the user can keep moving between the tabs.
        if (!isFocusInTabList()) {
            element.current.focus();
        }
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
