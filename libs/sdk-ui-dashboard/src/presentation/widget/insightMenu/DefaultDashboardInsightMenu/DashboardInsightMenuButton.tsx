// (C) 2021-2026 GoodData Corporation

import { type KeyboardEvent, type ReactElement, useCallback } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { objRefToString, widgetRef } from "@gooddata/sdk-model";
import { UiTooltip, isActionKey } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { getDashboardInsightMenuButtonId } from "../../../../_staging/accessibility/elementId.js";
import { type IDashboardInsightMenuButtonProps } from "../types.js";

export function DashboardInsightMenuButton({
    isOpen,
    items,
    widget,
    onClick,
}: IDashboardInsightMenuButtonProps): ReactElement | null {
    const intl = useIntl();

    const onMenuButtonClick = useCallback(() => {
        onClick();
    }, [onClick]);

    const onKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
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
    const menuId = `insight-menu-${widgetRefAsString}`;

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
        <UiTooltip
            triggerBy={["hover", "focus"]}
            arrowPlacement="top-start"
            content={intl.formatMessage({ id: "controlButtons.options.tooltip" })}
            anchor={
                <div
                    id={dashboardInsightMenuId}
                    className="dash-item-action-placeholder s-dash-item-action-placeholder"
                    onClick={onMenuButtonClick}
                    onKeyDown={onKeyDown}
                    role="button"
                    tabIndex={0}
                    aria-label={intl.formatMessage({ id: "controlButtons.options.tooltip" })}
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                    aria-controls={isOpen ? menuId : undefined}
                >
                    <div className={optionsIconClasses} />
                </div>
            }
        />
    );
}
