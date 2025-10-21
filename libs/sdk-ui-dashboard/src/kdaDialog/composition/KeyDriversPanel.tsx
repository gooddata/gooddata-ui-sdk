// (C) 2025 GoodData Corporation

import { useCallback, useEffect, useId } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import {
    UiButton,
    UiButtonSegmentedControl,
    UiIcon,
    UiIconButton,
    UiListbox,
    UiSkeleton,
    UiTooltip,
} from "@gooddata/sdk-ui-kit";

import { KeyDriverItem } from "../components/items/KeyDriverItem.js";
import { SummaryItem } from "../components/items/SummaryItem.js";
import { useSignificantDrives } from "../hooks/useDriversList.js";
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

    const { maximum, list, trendUp, trendDown } = useSignificantDrives();

    // When there are no items for selected trend, switch to the other trend
    useEffect(() => {
        if (state.itemsStatus !== "success") {
            return;
        }
        if (trendUp.length === 0 && trendDown.length > 0 && state.selectedTrend.includes("up")) {
            setState({ selectedTrend: ["down"] });
        }
        // eslint-disable-next-line
    }, [state.itemsStatus]);

    const upSelected = state.selectedTrend.includes("up");
    const downSelected = state.selectedTrend.includes("down");

    const onSelectCallback = useCallback(
        (trend: "up" | "down") => {
            const selected = state.selectedTrend.includes(trend);
            if (selected) {
                const selectedTrend = state.selectedTrend.filter((t) => trend !== t);
                if (selectedTrend.length === 0) {
                    selectedTrend.push(trend === "up" ? "down" : "up");
                }
                setState({
                    selectedTrend,
                });
            } else {
                const selectedTrend = [...state.selectedTrend, trend];
                setState({ selectedTrend });
            }
        },
        [setState, state.selectedTrend],
    );

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
                            isSelected={upSelected}
                            onClick={() => {
                                onSelectCallback("up");
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
                            isSelected={downSelected}
                            onClick={() => {
                                onSelectCallback("down");
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
                    <>
                        {list.length > 0 ? (
                            <UiListbox
                                items={list}
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
                        ) : (
                            <div className={cx("gd-kda-key-drivers-panel-list-empty")}>
                                <UiIcon type="drawerEmpty" size={26} color="currentColor" />
                                {upSelected && downSelected ? (
                                    <FormattedMessage id="kdaDialog.dialog.keyDrives.empty" />
                                ) : (
                                    <>
                                        {upSelected ? (
                                            <FormattedMessage id="kdaDialog.dialog.keyDrives.empty_up" />
                                        ) : (
                                            <FormattedMessage id="kdaDialog.dialog.keyDrives.empty_down" />
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function getSelectedItem(state: KdaState) {
    return typeof state.selectedItem === "string" ? undefined : state.selectedItem.id;
}
