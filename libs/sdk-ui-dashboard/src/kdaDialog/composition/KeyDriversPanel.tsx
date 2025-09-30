// (C) 2025 GoodData Corporation

import { useId, useMemo } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import {
    UiButton,
    UiButtonSegmentedControl,
    UiIconButton,
    UiListbox,
    UiSkeleton,
    UiTooltip,
} from "@gooddata/sdk-ui-kit";

import { KeyDriverItem } from "../components/items/KeyDriverItem.js";
import { SummaryItem } from "../components/items/SummaryItem.js";
import { KdaState } from "../internalTypes.js";
import { useKdaState } from "../providers/KdaState.js";

export interface KeyDriversPanelProps {
    detailsId: string;
    loading?: boolean;
}

export function KeyDriversPanel({ loading, detailsId }: KeyDriversPanelProps) {
    const intl = useIntl();
    const listId = useId();

    const label = intl.formatMessage({ id: "kdaDialog.dialog.keyDrives.title" });
    const tooltip = intl.formatMessage({ id: "kdaDialog.dialog.keyDrives.tooltip" });

    const { state, setState } = useKdaState();

    const trendUp = useMemo(
        () =>
            state.items.filter((item) => {
                return item.data.from.value < item.data.to.value;
            }),
        [state.items],
    );
    const trendDown = useMemo(
        () =>
            state.items.filter((item) => {
                return item.data.from.value > item.data.to.value;
            }),
        [state.items],
    );

    const currentItems = useMemo(() => {
        if (state.selectedTrend === "up") {
            return trendUp;
        }
        return trendDown;
    }, [state.selectedTrend, trendUp, trendDown]);
    const maximum = useMemo(() => {
        return Math.max(
            ...currentItems.map((item) => {
                return Math.abs(item.data.to.value - item.data.from.value);
            }),
        );
    }, [currentItems]);

    return (
        <div className={cx("gd-kda-key-drivers-panel")}>
            <div className={cx("gd-kda-key-drivers-panel-summary")}>
                {loading ? (
                    <UiSkeleton itemHeight={40} />
                ) : (
                    <SummaryItem
                        detailsId={detailsId}
                        isSelected={state.selectedItem === "summary"}
                        onSelect={() => {
                            setState({ selectedItem: "summary" });
                        }}
                    />
                )}
            </div>
            <div className={cx("gd-kda-key-drivers-panel-title")}>
                {loading ? (
                    <UiSkeleton itemHeight={21} itemWidth={70} />
                ) : (
                    <>
                        {label}
                        <UiTooltip
                            arrowPlacement="left"
                            triggerBy={["hover", "focus"]}
                            optimalPlacement
                            content={tooltip}
                            anchor={
                                <UiIconButton
                                    icon="question"
                                    variant="tertiary"
                                    size="xsmall"
                                    accessibilityConfig={{
                                        ariaLabel: label,
                                    }}
                                />
                            }
                        />
                    </>
                )}
            </div>
            <div className={cx("gd-kda-key-drivers-panel-trend")}>
                {loading ? (
                    <UiSkeleton itemHeight={27} />
                ) : (
                    <UiButtonSegmentedControl>
                        <UiButton
                            label={intl.formatMessage(
                                { id: "kdaDialog.dialog.keyDrives.button.trendUp" },
                                { count: trendUp.length },
                            )}
                            size="small"
                            isSelected={state.selectedTrend === "up"}
                            onClick={() => {
                                setState({ selectedTrend: "up" });
                            }}
                            accessibilityConfig={{
                                ariaControls: listId,
                            }}
                        />
                        <UiButton
                            label={intl.formatMessage(
                                { id: "kdaDialog.dialog.keyDrives.button.trendDown" },
                                { count: trendDown.length },
                            )}
                            size="small"
                            isSelected={state.selectedTrend === "down"}
                            onClick={() => {
                                setState({ selectedTrend: "down" });
                            }}
                            accessibilityConfig={{
                                ariaControls: listId,
                            }}
                        />
                    </UiButtonSegmentedControl>
                )}
            </div>
            <div className={cx("gd-kda-key-drivers-panel-list")}>
                {loading ? (
                    <div className={cx("gd-kda-key-drivers-panel-list-loading")}>
                        <UiSkeleton itemHeight={40} />
                        <UiSkeleton itemHeight={40} />
                        <UiSkeleton itemHeight={40} />
                        <UiSkeleton itemHeight={40} />
                        <UiSkeleton itemHeight={40} />
                        <UiSkeleton itemHeight={40} />
                    </div>
                ) : (
                    <UiListbox
                        items={currentItems}
                        ariaAttributes={{
                            id: listId,
                            "aria-controls": detailsId,
                        }}
                        InteractiveItemComponent={(props) => {
                            return <KeyDriverItem {...props} maximum={maximum} />;
                        }}
                        selectedItemId={getSelectedItem(state)}
                        onSelect={(item) => {
                            setState({ selectedItem: item });
                        }}
                    />
                )}
            </div>
        </div>
    );
}

function getSelectedItem(state: KdaState) {
    return typeof state.selectedItem === "string" ? undefined : state.selectedItem.id;
}
