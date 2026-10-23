// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

export function useDirtyChanged(
    onDirtyChanged: ((state: boolean, id: string) => void) | undefined,
    setDirty: (value: boolean) => void,
    defaultId: string,
): (dirty: boolean) => void {
    return useCallback(
        (dirty: boolean) => {
            if (onDirtyChanged) {
                onDirtyChanged(dirty, defaultId);
            }
            setDirty(dirty);
        },
        [onDirtyChanged, setDirty, defaultId],
    );
}
