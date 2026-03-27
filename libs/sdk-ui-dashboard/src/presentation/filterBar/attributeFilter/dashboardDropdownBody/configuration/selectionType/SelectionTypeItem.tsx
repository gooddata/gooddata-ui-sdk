// (C) 2026 GoodData Corporation

import cx from "classnames";

import { type DashboardAttributeFilterSelectionType } from "@gooddata/sdk-model";
import { UiTooltip } from "@gooddata/sdk-ui-kit";

interface ISelectionTypeItemProps {
    item: DashboardAttributeFilterSelectionType;
    itemTitle: string;
    tooltip: string;
    selected: boolean;
    disabled?: boolean;
    disabledTooltip?: string;
    onClick: () => void;
}

export function SelectionTypeItem({
    item,
    itemTitle,
    tooltip,
    selected,
    disabled,
    disabledTooltip,
    onClick,
}: ISelectionTypeItemProps) {
    const className = cx(
        "gd-list-item",
        "selection-kind-dropdown-item",
        {
            "is-selected": selected,
            "is-disabled": disabled,
        },
        "s-selection-kind-dropdown-item",
        `s-selection-kind-dropdown-item-${item}`,
    );

    const itemContent = (
        <div className={className} onClick={() => !disabled && onClick()}>
            <span className="selection-kind-dropdown-item-title">{itemTitle}</span>
            {disabled ? null : (
                <UiTooltip
                    anchor={<span className="selection-kind-dropdown-item-help gd-icon-circle-question" />}
                    content={<span style={{ whiteSpace: "pre-line", maxWidth: 240 }}>{tooltip}</span>}
                    arrowPlacement="left"
                    triggerBy={["hover"]}
                    anchorWrapperStyles={{ display: "flex", alignItems: "center" }}
                />
            )}
        </div>
    );

    if (disabled && disabledTooltip) {
        return (
            <UiTooltip
                anchor={itemContent}
                content={<span style={{ maxWidth: 240 }}>{disabledTooltip}</span>}
                arrowPlacement="left"
                triggerBy={["hover"]}
                anchorWrapperStyles={{ width: "100%", height: "100%" }}
            />
        );
    }

    return itemContent;
}
