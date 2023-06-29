// (C) 2021-2022 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";

import { IDashboardInsightMenuButtonProps } from "../types.js";
import { objRefToString, widgetRef } from "@gooddata/sdk-model";

export const DashboardInsightMenuButton = (props: IDashboardInsightMenuButtonProps): JSX.Element | null => {
    const { isOpen, items, widget, onClick } = props;

    const onMenuButtonClick = useCallback(() => {
        onClick();
    }, [onClick]);

    if (!items.length) {
        return null;
    }

    const widgetRefAsString = objRefToString(widgetRef(widget));

    const optionsIconClasses = cx(
        "dash-item-action-options",
        "dash-item-action-widget-options",
        "s-dash-item-action-widget-options",
        `dash-item-action-widget-options-${stringUtils.simplifyText(widgetRefAsString)}`,
        `s-dash-item-action-widget-options-${stringUtils.simplifyText(widgetRefAsString)}`,
        {
            "dash-item-action-widget-options-active": isOpen,
        },
    );

    return (
        <div
            className="dash-item-action-placeholder s-dash-item-action-placeholder"
            onClick={onMenuButtonClick}
        >
            <div className={optionsIconClasses} />
        </div>
    );
};
