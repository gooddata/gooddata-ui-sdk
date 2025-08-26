// (C) 2025 GoodData Corporation
import React, { ReactElement, useCallback, useEffect, useRef } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { objRefToString, widgetRef } from "@gooddata/sdk-model";
import {
    UiIcon,
    UiTooltip,
    isActionKey,
    programaticFocusManagement,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { IShowAsTableButtonProps } from "../types.js";

export const AS_TABLE_MENU_BUTTON_ID = "AS_TABLE_MENU_BUTTON_ID";

export function ShowAsTableButton(props: IShowAsTableButtonProps): ReactElement | null {
    const { widget, onClick, isWidgetAsTable, focusTargetRef } = props;
    const intl = useIntl();
    const previousIsWidgetAsTable = useRef(isWidgetAsTable);

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

    // Handle focus management when table/visualization state changes
    useEffect(() => {
        if (previousIsWidgetAsTable.current !== isWidgetAsTable && focusTargetRef?.current) {
            const targetElement = focusTargetRef.current;

            // First, look for the visualization container within the target element
            const visualizationElement = targetElement.querySelector(".visualization") as HTMLElement;

            programaticFocusManagement(visualizationElement);

            // Update the previous state
            previousIsWidgetAsTable.current = isWidgetAsTable;
        }

        // Update previous state even if no focus management needed
        previousIsWidgetAsTable.current = isWidgetAsTable;

        return undefined;
    }, [isWidgetAsTable, focusTargetRef]);

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
}
