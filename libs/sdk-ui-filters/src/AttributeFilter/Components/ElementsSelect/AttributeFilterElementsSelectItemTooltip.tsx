// (C) 2007-2025 GoodData Corporation

import React from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { UiTooltip } from "@gooddata/sdk-ui-kit";

/**
 * Props for the AttributeFilterElementsSelectItemTooltip component
 * @beta
 */
export interface IAttributeFilterElementsSelectItemTooltipProps {
    primaryLabelTitle?: string;
    itemPrimaryTitle?: string;
    isFocused?: boolean;
    id?: string;
}

export function AttributeFilterElementsSelectItemTooltip({
    primaryLabelTitle,
    itemPrimaryTitle,
    id,
    isFocused = false,
}: IAttributeFilterElementsSelectItemTooltipProps) {
    const { formatMessage } = useIntl();

    if (!primaryLabelTitle || !itemPrimaryTitle) {
        return null;
    }

    return (
        <UiTooltip
            hoverOpenDelay={0}
            hoverCloseDelay={0}
            arrowPlacement={"left"}
            optimalPlacement
            offset={15}
            isOpen={isFocused ? true : undefined}
            triggerBy={["focus", "hover"]}
            anchor={
                <div className="gd-item-title-tooltip-wrapper gd-list-item-only">
                    <span
                        role={"button"}
                        id={id}
                        tabIndex={-1}
                        className={cx("gd-icon-circle-question gd-empty-value-tooltip-icon", {
                            "gd-icon-circle-question--isFocusedSelectItem": isFocused,
                        })}
                        aria-label={formatMessage(
                            { id: "attributesDropdown.alternativeValueTooltip" },
                            { label: primaryLabelTitle, value: itemPrimaryTitle },
                        )}
                    />
                </div>
            }
            content={
                <div className={"gd-item-title-tooltip"}>
                    <h4>{primaryLabelTitle}</h4>
                    <p>{itemPrimaryTitle}</p>
                </div>
            }
        />
    );
}
