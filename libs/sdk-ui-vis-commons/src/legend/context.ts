// (C) 2025 GoodData Corporation

import React from "react";

import { createContextStore } from "@gooddata/sdk-ui";

import { ISeriesItem } from "./types.js";

export const useLegendSeriesContextValue = ({
    series,
    focusedIndex,
    id,
}: {
    series: ISeriesItem[];
    focusedIndex: number;
    id: string;
}) => {
    const descriptionId = `${id}-description`;

    const makeItemId = React.useCallback(
        (item?: ISeriesItem) => item && `${id}-${series.indexOf(item)}`,
        [id, series],
    );

    return React.useMemo(
        () => ({
            focusedItem: series[focusedIndex],
            makeItemId,
            descriptionId,
        }),
        [descriptionId, focusedIndex, makeItemId, series],
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
export const VisibilityContext = React.createContext<IVisibilityContext | null>(null);

/**
 * Hook for child components to use visibility detection
 * @internal
 */
export const useItemVisibility = () => {
    const context = React.useContext(VisibilityContext);
    if (!context) {
        throw new Error("useItemVisibility must be used within a VisibilityProvider");
    }
    return context;
};
