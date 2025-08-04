// (C) 2025 GoodData Corporation

import React from "react";
import { ISeriesItem } from "./types.js";
import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { makeLinearKeyboardNavigation, useIdPrefixed } from "@gooddata/sdk-ui-kit";
import { useAutoupdateRef } from "@gooddata/sdk-ui";
import { LegendSeriesContextStore, useLegendSeriesContextValue, VisibilityContext } from "./context.js";
import { useVisibilityDetection } from "./visibilityDetection.js";
import { LEGEND_AXIS_INDICATOR, LEGEND_SEPARATOR } from "./helpers.js";

interface ILegendSeriesProps {
    series: ISeriesItem[];
    label?: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
    onToggleItem: (item: ISeriesItem) => void;
    className?: string;
}

const isFocusableLegendItem = (item: ISeriesItem) =>
    item.type !== LEGEND_AXIS_INDICATOR && item.type !== LEGEND_SEPARATOR;

export const LegendSeries = React.forwardRef<HTMLElement, ILegendSeriesProps>(function LegendSeries(
    { series, label, style, children, onToggleItem, className },
    ref,
) {
    const { formatMessage } = useIntl();

    const [focusedIndex, setFocusedIndex] = React.useState(0);
    const id = useIdPrefixed("LegendSeries");

    // Create mapping of focusable items to their original indices
    const focusableIndicesMap = React.useMemo(() => {
        const map: number[] = [];
        series.forEach((item, index) => {
            if (isFocusableLegendItem(item)) {
                map.push(index);
            }
        });
        return map;
    }, [series]);

    React.useEffect(() => {
        // Set focus to the first focusable item when series changes
        const firstFocusableIndex = focusableIndicesMap[0] ?? 0;
        setFocusedIndex(firstFocusableIndex);
    }, [focusableIndicesMap]);

    const legendContextValue = useLegendSeriesContextValue({
        series,
        id,
        focusedIndex,
    });
    const { makeItemId, descriptionId } = legendContextValue;

    // Initialize visibility detection for legend items
    const { viewportRefCallback, contextValue: visibilityContextValue } = useVisibilityDetection();

    const keyDownDepsRef = useAutoupdateRef({
        focusedIndex,
        onToggleItem,
        series,
        visibilityContext: visibilityContextValue,
    });

    const handleKeyDown = React.useMemo<React.KeyboardEventHandler>(
        () =>
            makeLinearKeyboardNavigation({
                onFocusNext: () => {
                    const isVisible = visibilityContextValue.isVisible;
                    setFocusedIndex((prevIndex) =>
                        findNextVisibleOriginal(prevIndex, focusableIndicesMap, isVisible),
                    );
                },
                onFocusPrevious: () => {
                    const isVisible = visibilityContextValue.isVisible;
                    setFocusedIndex((prevIndex) =>
                        findPreviousVisibleOriginal(prevIndex, focusableIndicesMap, isVisible),
                    );
                },
                onFocusFirst: () => {
                    const isVisible = visibilityContextValue.isVisible;
                    const firstOriginalIndex = findFirstVisibleOriginal(focusableIndicesMap, isVisible);
                    setFocusedIndex(firstOriginalIndex);
                },
                onFocusLast: () => {
                    const isVisible = visibilityContextValue.isVisible;
                    const lastOriginalIndex = findLastVisibleOriginal(focusableIndicesMap, isVisible);
                    setFocusedIndex(lastOriginalIndex);
                },
                onSelect: () => {
                    const { onToggleItem, focusedIndex, series } = keyDownDepsRef.current;
                    onToggleItem(series[focusedIndex]);
                },
            }),
        [keyDownDepsRef, visibilityContextValue, focusableIndicesMap],
    );

    return (
        <LegendSeriesContextStore value={legendContextValue}>
            <VisibilityContext.Provider value={visibilityContextValue}>
                <div
                    className={cx("series-wrapper legend-series-wrapper", className)}
                    role={"group"}
                    aria-activedescendant={makeItemId(series[focusedIndex])}
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    ref={viewportRefCallback}
                >
                    <div
                        className={"series legend-series"}
                        role={"list"}
                        aria-label={
                            label
                                ? formatMessage({ id: "properties.legend.series.named" }, { name: label })
                                : formatMessage({ id: "properties.legend.series.unnamed" })
                        }
                        style={style}
                        ref={ref as React.MutableRefObject<HTMLDivElement>}
                    >
                        {children}
                    </div>

                    <p id={descriptionId} className={"sr-only"} role={"presentation"}>
                        <FormattedMessage id={"properties.legend.series.item.description"} />
                    </p>
                </div>
            </VisibilityContext.Provider>
        </LegendSeriesContextStore>
    );
});

// Helper functions for finding visible items using original indices
const findFirstVisibleOriginal = (focusableIndicesMap: number[], isVisible: (index: number) => boolean) => {
    for (const originalIndex of focusableIndicesMap) {
        if (isVisible(originalIndex)) {
            return originalIndex;
        }
    }
    return focusableIndicesMap[0] ?? 0;
};

const findLastVisibleOriginal = (focusableIndicesMap: number[], isVisible: (index: number) => boolean) => {
    for (let i = focusableIndicesMap.length - 1; i >= 0; i--) {
        const originalIndex = focusableIndicesMap[i];
        if (isVisible(originalIndex)) {
            return originalIndex;
        }
    }
    return focusableIndicesMap[focusableIndicesMap.length - 1] ?? 0;
};

const findNextVisibleOriginal = (
    currentOriginalIndex: number,
    focusableIndicesMap: number[],
    isVisible: (index: number) => boolean,
) => {
    const currentPosition = focusableIndicesMap.indexOf(currentOriginalIndex);
    if (currentPosition === -1) {
        return findFirstVisibleOriginal(focusableIndicesMap, isVisible);
    }

    let nextPosition = currentPosition + 1;
    let attempts = 0;
    while (attempts < focusableIndicesMap.length) {
        if (nextPosition >= focusableIndicesMap.length) {
            nextPosition = 0;
        }
        const nextOriginalIndex = focusableIndicesMap[nextPosition];
        if (isVisible(nextOriginalIndex)) {
            return nextOriginalIndex;
        }
        nextPosition++;
        attempts++;
    }
    return currentOriginalIndex;
};

const findPreviousVisibleOriginal = (
    currentOriginalIndex: number,
    focusableIndicesMap: number[],
    isVisible: (index: number) => boolean,
) => {
    const currentPosition = focusableIndicesMap.indexOf(currentOriginalIndex);
    if (currentPosition === -1) {
        return findLastVisibleOriginal(focusableIndicesMap, isVisible);
    }

    let prevPosition = currentPosition - 1;
    let attempts = 0;
    while (attempts < focusableIndicesMap.length) {
        if (prevPosition < 0) {
            prevPosition = focusableIndicesMap.length - 1;
        }
        const prevOriginalIndex = focusableIndicesMap[prevPosition];
        if (isVisible(prevOriginalIndex)) {
            return prevOriginalIndex;
        }
        prevPosition--;
        attempts++;
    }
    return currentOriginalIndex;
};
