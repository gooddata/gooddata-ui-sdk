// (C) 2025 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";
import { useIntl } from "react-intl";
import { isActionKey, useIdPrefixed } from "@gooddata/sdk-ui-kit";
import { IAsTableButtonProps } from "./types.js";
import { objRefToString, widgetRef } from "@gooddata/sdk-model";

export const AS_TABLE_MENU_BUTTON_ID = "AS_TABLE_MENU_BUTTON_ID";

export const AsTableButton = (props: IAsTableButtonProps): JSX.Element | null => {
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
        "dash-item-action-astable-options",
        "s-dash-item-action-astable-options",
        `dash-item-action-astable-options-${stringUtils.simplifyText(widgetRefAsString)}`,
        `s-dash-item-action-astable-options-${stringUtils.simplifyText(widgetRefAsString)}`,
    );

    const id = useIdPrefixed(AS_TABLE_MENU_BUTTON_ID);

    return (
        <div
            id={id}
            className="dash-item-action-placeholder s-dash-item-action-placeholder"
            onClick={onMenuButtonClick}
            onKeyDown={onKeyDown}
            role="button"
            tabIndex={0}
            title={intl.formatMessage({ id: "controlButtons.asTable" })}
            aria-label={intl.formatMessage({ id: "controlButtons.asTable" })}
        >
            <div className={asTableIconClasses}>{isWidgetAsTable ? "prepni zpet" : "prepni na tabulku"}</div>
        </div>
    );
};
