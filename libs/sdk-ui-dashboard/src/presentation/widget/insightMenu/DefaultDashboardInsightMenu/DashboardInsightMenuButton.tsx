// (C) 2021-2025 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";
import { useIntl } from "react-intl";
import { isActionKey } from "@gooddata/sdk-ui-kit";
import { IDashboardInsightMenuButtonProps } from "../types.js";
import { objRefToString, widgetRef } from "@gooddata/sdk-model";
import { getDashboardInsightMenuButtonId } from "../../../../_staging/accessibility/elementId.js";

export const DashboardInsightMenuButton = (props: IDashboardInsightMenuButtonProps): JSX.Element | null => {
    const { isOpen, items, widget, onClick } = props;
    const intl = useIntl();

    const onMenuButtonClick = useCallback(() => {
        onClick();
    }, [onClick]);

    const onKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            // This enables keyboard interaction events after focus
            if (isActionKey(event)) {
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

    const dashboardInsightMenuId = getDashboardInsightMenuButtonId(widgetRefAsString);

    return (
        <div
            id={dashboardInsightMenuId}
            className="dash-item-action-placeholder s-dash-item-action-placeholder"
            onClick={onMenuButtonClick}
            onKeyDown={onKeyDown}
            role="button"
            tabIndex={0}
            title={intl.formatMessage({ id: "widget.options.menu" })}
            aria-label={intl.formatMessage({ id: "controlButtons.options.tooltip" })}
        >
            <div className={optionsIconClasses} />
        </div>
    );
};
