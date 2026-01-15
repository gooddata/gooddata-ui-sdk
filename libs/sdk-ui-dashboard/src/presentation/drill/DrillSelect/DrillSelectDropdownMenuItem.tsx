// (C) 2025-2026 GoodData Corporation

import cx from "classnames";
import { compact } from "lodash-es";

import { type IUiMenuInteractiveItemProps, type IconType, UiIcon, UiTooltip } from "@gooddata/sdk-ui-kit";

import { DrillType } from "./types.js";
import { type IDrillSelectDropdownMenuItemData } from "../hooks/useDrillSelectDropdownMenuItems.js";

const DRILL_ICON_NAME: Record<DrillType, IconType> = {
    [DrillType.DRILL_TO_DASHBOARD]: "drillTo",
    [DrillType.DRILL_TO_INSIGHT]: "drillTo",
    [DrillType.DRILL_TO_URL]: "link",
    [DrillType.DRILL_DOWN]: "trendDown",
    [DrillType.CROSS_FILTERING]: "filter",
    [DrillType.KEY_DRIVER_ANALYSIS]: "explainai",
};

export function DrillSelectDropdownMenuItem({
    item,
}: IUiMenuInteractiveItemProps<IDrillSelectDropdownMenuItemData>) {
    const { type, name, attributeValue } = item.data;
    const { isDisabled, tooltip } = item;

    const renderLoading = () => {
        return (
            <div className="gd-drill-to-url-modal-picker s-drill-to-url-modal-picker">
                <div className="gd-spinner small" />
            </div>
        );
    };

    const itemClassName = cx("gd-drill-modal-picker-list-item", "s-gd-drill-modal-picker-item", `s-${type}`, {
        "is-disabled": isDisabled,
    });

    // make sure there is no trailing space in case attributeLabel is empty
    const title = compact([name, attributeValue]).join(" ");

    const content = (
        <div className={itemClassName} title={title}>
            <div className="gd-drill-modal-picker-icon-wrapper">
                <UiIcon type={DRILL_ICON_NAME[type]} size={16} color="complementary-5" />
            </div>
            {name ? (
                <p>
                    {name}
                    {attributeValue ? <span>&nbsp;({attributeValue})</span> : null}
                </p>
            ) : (
                renderLoading()
            )}
        </div>
    );

    if (tooltip) {
        return (
            <UiTooltip
                anchor={content}
                content={tooltip}
                optimalPlacement
                triggerBy={["hover"]}
                arrowPlacement="left"
            />
        );
    }

    return content;
}
