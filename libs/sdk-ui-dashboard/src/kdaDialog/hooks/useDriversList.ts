// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useTrendDrivers } from "./useTrendDrivers.js";
import { useKdaState } from "../providers/KdaState.js";

export function useSignificantDrives() {
    const { state } = useKdaState();
    const { trendUp, trendDown } = useTrendDrivers();

    const list = useMemo(() => {
        if (state.selectedTrend === "up") {
            return trendUp;
        }
        return trendDown;
    }, [state.selectedTrend, trendUp, trendDown]);

    const maximum = useMemo(() => {
        return Math.max(
            ...list.map((item) => {
                return Math.abs(item.data.to.value - item.data.from.value);
            }),
        );
    }, [list]);

    return {
        trendUp,
        trendDown,
        list,
        maximum,
    };
}
