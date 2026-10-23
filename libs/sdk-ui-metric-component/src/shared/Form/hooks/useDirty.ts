// (C) 2022-2026 GoodData Corporation

import { useEffect } from "react";

import { type FormStatus } from "./useFormStatusInternal.js";

export function useDirty(
    { isDirty }: FormStatus<unknown, unknown>,
    onDirtyChanged?: (state: boolean) => void,
): void {
    useEffect(() => {
        if (onDirtyChanged) {
            onDirtyChanged(isDirty);
        }
    }, [onDirtyChanged, isDirty]);
}
