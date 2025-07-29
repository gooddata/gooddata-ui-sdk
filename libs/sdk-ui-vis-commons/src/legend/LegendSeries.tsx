// (C) 2025 GoodData Corporation

import React from "react";
import { ISeriesItem } from "./types.js";
import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { makeLinearKeyboardNavigation, useIdPrefixed } from "@gooddata/sdk-ui-kit";
import { useAutoupdateRef } from "@gooddata/sdk-ui";
import { LegendSeriesContextStore, useLegendSeriesContextValue } from "./context.js";

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
        return series.filter(
            (item) => item.type !== "legendAxisIndicator" && item.type !== "legendSeparator",
        );
    }, [series]);

    const [focusedIndex, setFocusedIndex] = React.useState(0);
    const id = useIdPrefixed("LegendSeries");

    React.useEffect(() => {
        setFocusedIndex(0);
    }, [focusableSeriesItems.length]);

    const contextValue = useLegendSeriesContextValue({ series: focusableSeriesItems, id, focusedIndex });
    const { makeItemId, descriptionId } = contextValue;

    const keyDownDepsRef = useAutoupdateRef({
        focusedIndex,
        onToggleItem,
        focusableSeries: focusableSeriesItems,
    });
    const handleKeyDown = React.useMemo<React.KeyboardEventHandler>(
        () =>
            makeLinearKeyboardNavigation({
                onFocusNext: () => {
                    const { focusableSeries } = keyDownDepsRef.current;

                    setFocusedIndex((prevIndex) => {
                        const nextIndex = prevIndex + 1;
                        if (nextIndex >= focusableSeries.length) {
                            return 0;
                        }
                        return nextIndex;
                    });
                },
                onFocusPrevious: () => {
                    const { focusableSeries } = keyDownDepsRef.current;

                    setFocusedIndex((prevIndex) => {
                        const nextIndex = prevIndex - 1;
                        if (nextIndex < 0) {
                            return focusableSeries.length - 1;
                        }
                        return nextIndex;
                    });
                },
                onFocusFirst: () => {
                    setFocusedIndex(0);
                },
                onFocusLast: () => {
                    const { focusableSeries } = keyDownDepsRef.current;

                    setFocusedIndex(focusableSeries.length - 1);
                },
                onSelect: () => {
                    const { onToggleItem, focusedIndex, focusableSeries } = keyDownDepsRef.current;

                    onToggleItem(focusableSeries[focusedIndex]);
                },
            }),
        [keyDownDepsRef],
    );

    return (
        <LegendSeriesContextStore value={contextValue}>
            <div
                className={cx("series-wrapper legend-series-wrapper", className)}
                role={"group"}
                aria-activedescendant={makeItemId(focusableSeriesItems[focusedIndex])}
                tabIndex={0}
                onKeyDown={handleKeyDown}
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
        </LegendSeriesContextStore>
    );
});
