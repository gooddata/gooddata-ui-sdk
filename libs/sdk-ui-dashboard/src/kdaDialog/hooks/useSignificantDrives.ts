// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useKdaState } from "../providers/KdaState.js";

export function useSignificantDrives() {
    const { state } = useKdaState();

    return useMemo(() => {
        return state.items.filter((s) => s.data.isSignificant);
    }, [state.items]);
}
