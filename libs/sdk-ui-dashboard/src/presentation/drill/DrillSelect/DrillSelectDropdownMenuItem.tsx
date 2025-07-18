// (C) 2025 GoodData Corporation

import { SyntheticEvent } from "react";
import cx from "classnames";
import compact from "lodash/compact.js";
import { Icon, IUiMenuInteractiveItemProps } from "@gooddata/sdk-ui-kit";

import { DrillType } from "./types.js";
import { IDrillSelectDropdownMenuItemData } from "../hooks/useDrillSelectDropdownMenuItems.js";

const DRILL_ICON_NAME: Record<DrillType, string> = {
    [DrillType.DRILL_TO_DASHBOARD]: "DrillToDashboard",
    [DrillType.DRILL_TO_INSIGHT]: "DrillToInsight",
    [DrillType.DRILL_TO_URL]: "Hyperlink",
    [DrillType.DRILL_DOWN]: "DrillDown",
    [DrillType.CROSS_FILTERING]: "AttributeFilter",
};

export function DrillSelectDropdownMenuItem(
    props: IUiMenuInteractiveItemProps<IDrillSelectDropdownMenuItemData>,
) {
    const {
        item: {
            data: { type, name, attributeValue, onSelect },
        },
    } = props;

    const renderLoading = () => {
        return (
            <div className="gd-drill-to-url-modal-picker s-drill-to-url-modal-picker">
                <div className="gd-spinner small" />
            </div>
        );
    };

    const onClick = (e: SyntheticEvent) => {
        e.preventDefault();
        onSelect();
    };

    const itemClassName = cx(
        "gd-drill-modal-picker-list-item",
        "s-gd-drill-modal-picker-item",
        `s-${type}`,
        {},
    );

    const IconComponent = Icon[DRILL_ICON_NAME[type]];

    const shouldHaveAriaPopup = type === DrillType.DRILL_TO_INSIGHT || type === DrillType.DRILL_DOWN;

    // make sure there is no trailing space in case attributeLabel is empty
    const title = compact([name, attributeValue]).join(" ");

    return (
        <button
            onClick={onClick}
            className={itemClassName}
            title={title}
            aria-haspopup={shouldHaveAriaPopup ? "dialog" : undefined}
        >
            <div className="gd-drill-modal-picker-icon-wrapper">
                <IconComponent />
            </div>
            {!name ? (
                renderLoading()
            ) : (
                <p>
                    {name}
                    {attributeValue ? <span>&nbsp;({attributeValue})</span> : null}
                </p>
            )}
        </button>
    );
}
