// (C) 2022-2026 GoodData Corporation

import cx from "classnames";

import { type DashboardAttributeFilterSelectionMode } from "@gooddata/sdk-model";
import { TOOLTIP_WIDTH_MEDIUM, UiTooltip } from "@gooddata/sdk-ui-kit";

interface ISelectionModeItemProps {
    item: DashboardAttributeFilterSelectionMode;
    itemTitle: string;
    tooltip?: string;
    selected: boolean;
    disabled: boolean;
    disabledTooltip: string;
    onClick: () => void;
}

export function SelectionModeItem({
    item,
    itemTitle,
    tooltip,
    selected,
    disabled,
    disabledTooltip,
    onClick,
}: ISelectionModeItemProps) {
    const className = cx(
        "gd-list-item",
        "selection-kind-dropdown-item",
        {
            "is-selected": selected,
            "is-disabled": disabled,
        },
        "s-selection-mode-dropdown-item",
        `s-selection-mode-dropdown-item-${item}`,
    );

    const tooltipText = disabled ? disabledTooltip : tooltip;

    return (
        <div className={className} onClick={() => !disabled && onClick()}>
            <span className="selection-kind-dropdown-item-title">{itemTitle}</span>
            {tooltipText ? (
                <UiTooltip
                    anchor={<span className="selection-kind-dropdown-item-help gd-icon-circle-question" />}
                    content={tooltipText}
                    arrowPlacement="left"
                    triggerBy={["hover"]}
                    width={TOOLTIP_WIDTH_MEDIUM}
                    anchorWrapperStyles={{ display: "flex", alignItems: "center" }}
                />
            ) : null}
        </div>
    );
}
