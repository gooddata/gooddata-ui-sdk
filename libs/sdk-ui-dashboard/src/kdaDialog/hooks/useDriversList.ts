// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { type IUiListboxInteractiveItem } from "@gooddata/sdk-ui-kit";

import { useTrendDrivers } from "./useTrendDrivers.js";
import { type IKdaItem, type IKdaTrend } from "../internalTypes.js";
import { useKdaState } from "../providers/KdaState.js";

export function useSignificantDrives() {
    const intl = useIntl();
    const { state } = useKdaState();
    const { trendUp, trendDown } = useTrendDrivers();

    const trends = useMemo(() => {
        const list: IUiListboxInteractiveItem<{ trend: IKdaTrend; driver: number }>[] = [
            {
                type: "interactive",
                id: "up",
                stringTitle: intl.formatMessage({ id: "kdaDialog.dialog.keyDrives.button.trendUp" }),
                data: {
                    trend: "up",
                    driver: trendUp.length,
                },
                isDisabled: trendUp.length === 0,
            },
            {
                type: "interactive",
                id: "down",
                stringTitle: intl.formatMessage({ id: "kdaDialog.dialog.keyDrives.button.trendDown" }),
                data: {
                    trend: "down",
                    driver: trendDown.length,
                },
                isDisabled: trendDown.length === 0,
            },
            {
                type: "interactive",
                id: "all",
                stringTitle: intl.formatMessage({ id: "kdaDialog.dialog.keyDrives.button.trendAll" }),
                data: {
                    trend: "all",
                    driver: trendUp.length + trendDown.length,
                },
            },
        ];
        return list;
    }, [trendUp, trendDown, intl]);

    const list = useMemo(() => {
        const selected: IUiListboxInteractiveItem<IKdaItem>[] = [];
        if (state.selectedTrend === "up") {
            selected.push(...trendUp);
        }
        if (state.selectedTrend === "down") {
            selected.push(...trendDown);
        }
        if (state.selectedTrend === "all") {
            selected.push(...trendUp);
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
        trends,
        maximum,
    };
}
