// (C) 2025 GoodData Corporation

import cx from "classnames";
import { compact } from "lodash-es";

import { type IUiMenuInteractiveItemProps, type IconType, UiIcon } from "@gooddata/sdk-ui-kit";

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
    item: {
        data: { type, name, attributeValue },
    },
}: IUiMenuInteractiveItemProps<IDrillSelectDropdownMenuItemData>) {
    const renderLoading = () => {
        return (
            <div className="gd-drill-to-url-modal-picker s-drill-to-url-modal-picker">
                <div className="gd-spinner small" />
            </div>
        );
    };

    const itemClassName = cx(
        "gd-drill-modal-picker-list-item",
        "s-gd-drill-modal-picker-item",
        `s-${type}`,
        {},
    );

    // make sure there is no trailing space in case attributeLabel is empty
    const title = compact([name, attributeValue]).join(" ");

    return (
        <div className={itemClassName} title={title}>
            <div className="gd-drill-modal-picker-icon-wrapper">
                <UiIcon type={DRILL_ICON_NAME[type]} size={16} color="complementary-5" ariaHidden />
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
}
