// (C) 2021-2026 GoodData Corporation

import { type Dispatch, type MutableRefObject, type SetStateAction, useEffect } from "react";

import { useProp } from "../../shared/hooks/useProp.js";

export function useInitialValues<S>(
    defaultValue: S,
    initialValues?: S,
): [S, Dispatch<SetStateAction<S>>, MutableRefObject<boolean>] {
    const [state, setState, initial] = useProp(initialValues || defaultValue);

    useEffect(() => {
        if (initialValues) {
            setState(defaultValue);
        }
        // oxlint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return [state, setState, initial];
}
