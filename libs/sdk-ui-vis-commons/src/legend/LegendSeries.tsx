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

export const LegendSeries = React.forwardRef<HTMLElement, ILegendSeriesProps>(function LegendSeries(
    { series, label, style, children, onToggleItem, className },
    ref,
) {
    const { formatMessage } = useIntl();

    const focusableSeriesItems = React.useMemo(() => {
        return series.filter((item) => item.type !== LEGEND_AXIS_INDICATOR && item.type !== LEGEND_SEPARATOR);
    }, [series]);

    const [focusedIndex, setFocusedIndex] = React.useState(0);
    const id = useIdPrefixed("LegendSeries");

    React.useEffect(() => {
        setFocusedIndex(0);
    }, [focusableSeriesItems.length]);

    const legendContextValue = useLegendSeriesContextValue({
        series: focusableSeriesItems,
        id,
        focusedIndex,
    });
    const { makeItemId, descriptionId } = legendContextValue;

    // Initialize visibility detection for legend items
    const { viewportRefCallback, contextValue: visibilityContextValue } = useVisibilityDetection();

    const keyDownDepsRef = useAutoupdateRef({
        focusedIndex,
        onToggleItem,
        focusableSeries: focusableSeriesItems,
        visibilityContext: visibilityContextValue,
    });

    const handleKeyDown = React.useMemo<React.KeyboardEventHandler>(
        () =>
            makeLinearKeyboardNavigation({
                onFocusNext: () => {
                    const { focusableSeries } = keyDownDepsRef.current;
                    const isVisible = visibilityContextValue.isVisible;
                    setFocusedIndex((prevIndex) =>
                        findNextVisible(prevIndex, focusableSeries.length, isVisible),
                    );
                },
                onFocusPrevious: () => {
                    const { focusableSeries } = keyDownDepsRef.current;
                    const isVisible = visibilityContextValue.isVisible;
                    setFocusedIndex((prevIndex) =>
                        findPreviousVisible(prevIndex, focusableSeries.length, isVisible),
                    );
                },
                onFocusFirst: () => {
                    const { focusableSeries } = keyDownDepsRef.current;
                    const isVisible = visibilityContextValue.isVisible;
                    setFocusedIndex(findFirstVisible(focusableSeries.length, isVisible));
                },
                onFocusLast: () => {
                    const { focusableSeries } = keyDownDepsRef.current;
                    const isVisible = visibilityContextValue.isVisible;
                    setFocusedIndex(findLastVisible(focusableSeries.length, isVisible));
                },
                onSelect: () => {
                    const { onToggleItem, focusedIndex, focusableSeries } = keyDownDepsRef.current;
                    onToggleItem(focusableSeries[focusedIndex]);
                },
            }),
        [keyDownDepsRef, visibilityContextValue],
    );

    return (
        <LegendSeriesContextStore value={legendContextValue}>
            <VisibilityContext.Provider value={visibilityContextValue}>
                <div
                    className={cx("series-wrapper legend-series-wrapper", className)}
                    role={"group"}
                    aria-activedescendant={makeItemId(focusableSeriesItems[focusedIndex])}
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

// Helper functions for finding visible items
const findFirstVisible = (seriesLength: number, isVisible: (index: number) => boolean) => {
    for (let i = 0; i < seriesLength; i++) {
        if (isVisible(i)) {
            return i;
        }
    }
    return 0;
};

const findLastVisible = (seriesLength: number, isVisible: (index: number) => boolean) => {
    for (let i = seriesLength - 1; i >= 0; i--) {
        if (isVisible(i)) {
            return i;
        }
    }
    return seriesLength - 1;
};

const findNextVisible = (
    currentIndex: number,
    seriesLength: number,
    isVisible: (index: number) => boolean,
) => {
    let nextIndex = currentIndex + 1;
    let attempts = 0;
    while (attempts < seriesLength) {
        if (nextIndex >= seriesLength) {
            nextIndex = 0;
        }
        if (isVisible(nextIndex)) {
            return nextIndex;
        }
        nextIndex++;
        attempts++;
    }
    return currentIndex;
};

const findPreviousVisible = (
    currentIndex: number,
    seriesLength: number,
    isVisible: (index: number) => boolean,
) => {
    let prevIndex = currentIndex - 1;
    let attempts = 0;
    while (attempts < seriesLength) {
        if (prevIndex < 0) {
            prevIndex = seriesLength - 1;
        }
        if (isVisible(prevIndex)) {
            return prevIndex;
        }
        prevIndex--;
        attempts++;
    }
    return currentIndex;
};
