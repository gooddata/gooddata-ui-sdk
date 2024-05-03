// (C) 2021-2024 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";
import { useIntl } from "react-intl";

import { IDashboardInsightMenuButtonProps } from "../types.js";
import { objRefToString, widgetRef } from "@gooddata/sdk-model";

export const DashboardInsightMenuButton = (props: IDashboardInsightMenuButtonProps): JSX.Element | null => {
    const { isOpen, items, widget, onClick } = props;
    const intl = useIntl();

    const onMenuButtonClick = useCallback(() => {
        onClick();
    }, [onClick]);

    const onKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            // This enables keyboard interaction events after focus
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
            }
        },
        [onClick],
    );

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
            onKeyDown={onKeyDown}
            role="button"
            tabIndex={0}
            title={intl.formatMessage({ id: "widget.options.menu" })}
        >
            <div className={optionsIconClasses} />
        </div>
    );
};
