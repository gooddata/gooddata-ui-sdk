// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { type IUiListboxInteractiveItem } from "@gooddata/sdk-ui-kit";

import { useTrendDrivers } from "./useTrendDrivers.js";
import { type IKdaItem } from "../internalTypes.js";
import { useKdaState } from "../providers/KdaState.js";

export function useSignificantDrives() {
    const { state } = useKdaState();
    const { trendUp, trendDown } = useTrendDrivers();

    const list = useMemo(() => {
        const selected: IUiListboxInteractiveItem<IKdaItem>[] = [];
        if (state.selectedTrend.includes("up")) {
            selected.push(...trendUp);
        }
        if (state.selectedTrend.includes("down")) {
            selected.push(...trendDown);
        }
        return selected.sort((a, b) => {
            return (
                Math.abs(b.data.to.value - b.data.from.value) - Math.abs(a.data.to.value - a.data.from.value)
            );
        });
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
