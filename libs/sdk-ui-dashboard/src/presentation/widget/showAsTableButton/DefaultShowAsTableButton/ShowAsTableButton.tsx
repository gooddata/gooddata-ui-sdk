// (C) 2025 GoodData Corporation
import React, { ReactElement, useCallback } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { objRefToString, widgetRef } from "@gooddata/sdk-model";
import { UiIcon, UiTooltip, isActionKey, useIdPrefixed } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { IShowAsTableButtonProps } from "../types.js";

export const AS_TABLE_MENU_BUTTON_ID = "AS_TABLE_MENU_BUTTON_ID";

export const ShowAsTableButton = (props: IShowAsTableButtonProps): ReactElement | null => {
    const { widget, onClick, isWidgetAsTable } = props;
    const intl = useIntl();

    const onMenuButtonClick = useCallback(() => {
        onClick();
    }, [onClick]);

    const onKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (isActionKey(event)) {
                event.preventDefault();
                onClick();
            }
        },
        [onClick],
    );

    const widgetRefAsString = objRefToString(widgetRef(widget));

    const asTableIconClasses = cx(
        "dash-item-action-options",
        "dash-item-action-as-table",
        `s-dash-item-action-as-table-options-${stringUtils.simplifyText(widgetRefAsString)}`,
        {
            "s-dash-item-action-as-table": !isWidgetAsTable,
            "s-dash-item-action-as-original": isWidgetAsTable,
        },
    );

    const id = useIdPrefixed(AS_TABLE_MENU_BUTTON_ID);

    const title = isWidgetAsTable
        ? intl.formatMessage({ id: "controlButtons.asOriginal" })
        : intl.formatMessage({ id: "controlButtons.asTable" });

    const iconType = isWidgetAsTable ? "visualization" : "table";

    return (
        <UiTooltip
            triggerBy={["hover", "focus"]}
            arrowPlacement="top-start"
            content={title}
            anchor={
                <div
                    id={id}
                    className="dash-item-action-placeholder s-dash-item-action-placeholder"
                    onClick={onMenuButtonClick}
                    onKeyDown={onKeyDown}
                    role="button"
                    tabIndex={0}
                    aria-label={title}
                >
                    <div className={asTableIconClasses}>
                        <UiIcon ariaHidden={true} size={18} type={iconType} color="complementary-7" />
                    </div>
                </div>
            }
        />
    );
};
