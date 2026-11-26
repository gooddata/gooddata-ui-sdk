// (C) 2025-2026 GoodData Corporation

import { createContext, useCallback, useContext, useMemo } from "react";

import { createContextStore } from "@gooddata/sdk-ui";

import { type ISeriesItem, isSeriesItemMetric } from "./types.js";

export const useLegendSeriesContextValue = ({
    series,
    allSeries = series,
    focusedIndex,
    id,
}: {
    series: ISeriesItem[];
    /**
     * The whole legend when `series` is only its current page. Option positions and set size
     * are counted from it, so they stay correct across pages.
     */
    allSeries?: ISeriesItem[];
    focusedIndex: number;
    id: string;
}) => {
    const makeItemId = useCallback(
        (item?: ISeriesItem) => item && `${id}-${series.indexOf(item)}`,
        [id, series],
    );

    // Options are rendered inside groups and wrapper elements, so browsers can't compute
    // their position and set size from the DOM. Compute them explicitly across the whole legend,
    // including items on other pages of a paged legend.
    const optionItems = useMemo(
        () => allSeries.filter((item) => isSeriesItemMetric(item) && !item.anomaly),
        [allSeries],
    );

    const getItemPosition = useCallback(
        (item: ISeriesItem) => {
            const index = optionItems.indexOf(item);
            return index === -1 ? undefined : { posInSet: index + 1, setSize: optionItems.length };
        },
        [optionItems],
    );

    return useMemo(
        () => ({
            focusedItem: series[focusedIndex],
            makeItemId,
            getItemPosition,
        }),
        [focusedIndex, makeItemId, getItemPosition, series],
    );
};

export const LegendSeriesContextStore =
    createContextStore<ReturnType<typeof useLegendSeriesContextValue>>("LegendSeries");

/**
 * Context for tracking visibility of legend items
 * @internal
 */
export interface IVisibilityContext {
    registerItem: (index: number, element: HTMLElement | null) => void;
    isVisible: (index: number) => boolean;
    visibleItems: Set<number>;
}

/**
 * React context for visibility detection
 * @internal
 */
export const VisibilityContext = createContext<IVisibilityContext | null>(null);

/**
 * Hook for child components to use visibility detection
 * @internal
 */
export const useItemVisibility = () => {
    const context = useContext(VisibilityContext);
    if (!context) {
        throw new Error("useItemVisibility must be used within a VisibilityProvider");
    }
    return context;
};
