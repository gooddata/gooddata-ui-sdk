// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useSignificantDrives } from "./useSignificantDrives.js";

export function useTrendDrivers() {
    const significantDrives = useSignificantDrives();

    const trendUp = useMemo(
        () =>
            significantDrives.filter((item) => {
                return item.data.from.value < item.data.to.value;
            }),
        [significantDrives],
    );
    const trendDown = useMemo(
        () =>
            significantDrives.filter((item) => {
                return item.data.from.value > item.data.to.value;
            }),
        [significantDrives],
    );

    return {
        trendUp,
        trendDown,
    };
}
