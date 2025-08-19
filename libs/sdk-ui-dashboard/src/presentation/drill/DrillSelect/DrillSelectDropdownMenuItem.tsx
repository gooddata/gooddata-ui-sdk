// (C) 2025 GoodData Corporation

import React, { SyntheticEvent } from "react";

import cx from "classnames";
import compact from "lodash/compact.js";

import { IUiMenuInteractiveItemProps, IconType, UiIcon } from "@gooddata/sdk-ui-kit";

import { DrillType } from "./types.js";
import { IDrillSelectDropdownMenuItemData } from "../hooks/useDrillSelectDropdownMenuItems.js";

const DRILL_ICON_NAME: Record<DrillType, IconType> = {
    [DrillType.DRILL_TO_DASHBOARD]: "drillTo",
    [DrillType.DRILL_TO_INSIGHT]: "drillTo",
    [DrillType.DRILL_TO_URL]: "link",
    [DrillType.DRILL_DOWN]: "trendDown",
    [DrillType.CROSS_FILTERING]: "filter",
};

export const DrillSelectDropdownMenuItem: React.FC<
    IUiMenuInteractiveItemProps<IDrillSelectDropdownMenuItemData>
> = (props) => {
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
                <UiIcon type={DRILL_ICON_NAME[type]} size={16} color="complementary-5" ariaHidden />
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
};
