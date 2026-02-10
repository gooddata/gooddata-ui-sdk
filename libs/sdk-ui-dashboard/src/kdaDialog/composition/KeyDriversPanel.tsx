// (C) 2025-2026 GoodData Corporation

import { useId, useRef } from "react";

import cx from "classnames";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import {
    UiButton,
    UiDropdown,
    UiIcon,
    UiIconButton,
    UiListbox,
    UiSkeleton,
    UiTooltip,
} from "@gooddata/sdk-ui-kit";

import { KeyDriverItem } from "../components/items/KeyDriverItem.js";
import { TrendItem } from "../components/items/TrendItem.js";
import { useSignificantDrives } from "../hooks/useDriversList.js";
import { type IKdaState } from "../internalTypes.js";
import { useKdaState } from "../providers/KdaState.js";

export interface IKeyDriversPanelProps {
    detailsId: string;
    loading?: boolean;
}

const trendMessages = defineMessages({
    up: { id: "kdaDialog.dialog.keyDrives.button.trendUp" },
    down: { id: "kdaDialog.dialog.keyDrives.button.trendDown" },
    all: { id: "kdaDialog.dialog.keyDrives.button.trendAll" },
});

export function KeyDriversPanel({ loading, detailsId }: IKeyDriversPanelProps) {
    const intl = useIntl();
    const listTitleId = useId();
    const listId = useId();
    const trendOpener = useRef<HTMLButtonElement>(null);

    const label = intl.formatMessage({ id: "kdaDialog.dialog.keyDrives.title" });
    const tooltip = intl.formatMessage({ id: "kdaDialog.dialog.keyDrives.tooltip" });

    const { state, setState } = useKdaState();

    const { maximum, list, trends, trendUp, trendDown } = useSignificantDrives();

    const upSelected = state.selectedTrend === "up";
    const allSelected = state.selectedTrend === "all";
    const countSelected = allSelected
        ? trendUp.length + trendDown.length
        : upSelected
          ? trendUp.length
          : trendDown.length;

    return (
        <div className={cx("gd-kda-key-drivers-panel")}>
            <div className={cx("gd-kda-key-drivers-panel-title")} id={listTitleId}>
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
                    <UiDropdown
                        closeOnEscape
                        autofocusOnOpen
                        closeOnOutsideClick
                        onOpen={() => {
                            setState({
                                trendDropdownOpen: true,
                            });
                        }}
                        onClose={() => {
                            setTimeout(() => {
                                setState({
                                    trendDropdownOpen: false,
                                });
                            }, 10);
                        }}
                        renderButton={(props) => (
                            <UiButton
                                ref={trendOpener}
                                size="medium"
                                label={intl.formatMessage(trendMessages[state.selectedTrend || "all"])}
                                iconAfter={props.isOpen ? "chevronUp" : "chevronDown"}
                                badgeAfter={intl.formatMessage(
                                    { id: "kdaDialog.dialog.keyDrives.drivers" },
                                    { count: countSelected },
                                )}
                                iconAfterSize={11}
                                onClick={props.toggleDropdown}
                            />
                        )}
                        renderBody={(props) => (
                            <UiListbox
                                width={trendOpener.current?.offsetWidth ?? 200}
                                items={trends}
                                ariaAttributes={{
                                    id: props.ariaAttributes.id,
                                    "aria-controls": detailsId,
                                    "aria-labelledby": listTitleId,
                                }}
                                InteractiveItemComponent={(props) => {
                                    return <TrendItem {...props} />;
                                }}
                                selectedItemId={getSelectedTrend(state)}
                                onSelect={(item) => {
                                    setState({ selectedTrend: item.data.trend });
                                    props.closeDropdown();
                                }}
                            />
                        )}
                    />
                )}
            </div>
            <div
                className={cx("gd-kda-key-drivers-panel-list", {
                    empty: list.length === 0,
                })}
            >
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
                                    "aria-labelledby": listTitleId,
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
                                <FormattedMessage id="kdaDialog.dialog.keyDrives.empty" />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function getSelectedItem(state: IKdaState) {
    return typeof state.selectedItem === "string" ? undefined : state.selectedItem.id;
}

function getSelectedTrend(state: IKdaState) {
    return state.selectedTrend;
}
