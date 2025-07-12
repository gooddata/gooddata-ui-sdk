// (C) 2025 GoodData Corporation

import {
    ReactNode,
    CSSProperties,
    MutableRefObject,
    forwardRef,
    useState,
    useEffect,
    useMemo,
    KeyboardEventHandler,
} from "react";
import { ISeriesItem } from "./types.js";
import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { makeLinearKeyboardNavigation, useIdPrefixed } from "@gooddata/sdk-ui-kit";
import { useAutoupdateRef } from "@gooddata/sdk-ui";
import { LegendSeriesContextStore, useLegendSeriesContextValue } from "./context.js";

interface ILegendSeriesProps {
    series: ISeriesItem[];
    label?: string;
    children: ReactNode;
    style?: CSSProperties;
    onToggleItem: (item: ISeriesItem) => void;
    className?: string;
}

export const LegendSeries = forwardRef<HTMLElement, ILegendSeriesProps>(function LegendSeries(
    { series, label, style, children, onToggleItem, className },
    ref,
) {
    const { formatMessage } = useIntl();

    const [focusedIndex, setFocusedIndex] = useState(0);
    const id = useIdPrefixed("LegendSeries");

    useEffect(() => {
        setFocusedIndex(0);
    }, [series.length]);

    const contextValue = useLegendSeriesContextValue({ series, id, focusedIndex });
    const { makeItemId, descriptionId } = contextValue;

    const keyDownDepsRef = useAutoupdateRef({
        focusedIndex,
        onToggleItem,
        series,
    });
    const handleKeyDown = useMemo<KeyboardEventHandler>(
        () =>
            makeLinearKeyboardNavigation({
                onFocusNext: () => {
                    const { series } = keyDownDepsRef.current;

                    setFocusedIndex((prevIndex) => {
                        const nextIndex = prevIndex + 1;
                        if (nextIndex >= series.length) {
                            return 0;
                        }
                        return nextIndex;
                    });
                },
                onFocusPrevious: () => {
                    const { series } = keyDownDepsRef.current;

                    setFocusedIndex((prevIndex) => {
                        const nextIndex = prevIndex - 1;
                        if (nextIndex < 0) {
                            return series.length - 1;
                        }
                        return nextIndex;
                    });
                },
                onFocusFirst: () => {
                    setFocusedIndex(0);
                },
                onFocusLast: () => {
                    const { series } = keyDownDepsRef.current;

                    setFocusedIndex(series.length - 1);
                },
                onSelect: () => {
                    const { onToggleItem, focusedIndex, series } = keyDownDepsRef.current;

                    onToggleItem(series[focusedIndex]);
                },
            }),
        [keyDownDepsRef],
    );

    return (
        <LegendSeriesContextStore value={contextValue}>
            <div
                className={cx("series-wrapper legend-series-wrapper", className)}
                role={"group"}
                aria-activedescendant={makeItemId(series[focusedIndex])}
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
                    ref={ref as MutableRefObject<HTMLDivElement>}
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
