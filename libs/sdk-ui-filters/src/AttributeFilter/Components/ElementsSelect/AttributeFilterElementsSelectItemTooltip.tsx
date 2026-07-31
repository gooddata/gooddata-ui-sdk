// (C) 2007-2026 GoodData Corporation

import { useEffect, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { UiIcon, UiTooltip, useCloseOnEscape } from "@gooddata/sdk-ui-kit";

/**
 * Props for the AttributeFilterElementsSelectItemTooltip component
 * @beta
 */
export interface IAttributeFilterElementsSelectItemTooltipProps {
    primaryLabelTitle?: string;
    itemPrimaryTitle?: string;
    isFocused?: boolean;
    /** Id of the focusable element itself (grid representation only - the roving tabindex target). */
    id?: string;
    renderAsCell?: boolean;
}

export function AttributeFilterElementsSelectItemTooltip({
    primaryLabelTitle,
    itemPrimaryTitle,
    id,
    isFocused = false,
    renderAsCell = true,
}: IAttributeFilterElementsSelectItemTooltipProps) {
    const { formatMessage } = useIntl();

    // Reveal only on keyboard focus (:focus-visible), not a mouse-click focus - LX-2753.
    const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);

    useEffect(() => {
        if (!isFocused) {
            setIsKeyboardFocused(false);
            return;
        }

        setIsKeyboardFocused(document.activeElement?.matches(":focus-visible") ?? false);
    }, [isFocused]);

    // Escape hides the tooltip without closing the dropdown - LX-2753 / WCAG 1.4.13.
    useCloseOnEscape(isKeyboardFocused, () => setIsKeyboardFocused(false), true);

    if (!primaryLabelTitle || !itemPrimaryTitle) {
        return null;
    }

    return (
        <div
            role={renderAsCell ? "gridcell" : undefined}
            id={renderAsCell ? id : undefined}
            tabIndex={renderAsCell ? (isFocused ? 0 : -1) : undefined}
            aria-label={renderAsCell ? formatMessage({ id: "attributesDropdown.detailsLabel" }) : undefined}
        >
            <UiTooltip
                hoverOpenDelay={0}
                hoverCloseDelay={0}
                arrowPlacement={"left"}
                optimalPlacement
                offset={15}
                isOpen={isKeyboardFocused ? true : undefined}
                triggerBy={["hover"]}
                anchor={
                    <div
                        className={cx("gd-list-item-only gd-item-title-tooltip-wrapper", {
                            // Icon is a real focus target only in the grid (multi-select) case.
                            "gd-list-item-only--isFocusedSelectItem": renderAsCell && isFocused,
                        })}
                    >
                        <UiIcon color="currentColor" layout={"block"} size={13} type={"question"} />
                    </div>
                }
                content={
                    <div className={"gd-item-title-tooltip"}>
                        <h4>{primaryLabelTitle}</h4>
                        <p>{itemPrimaryTitle}</p>
                    </div>
                }
            />
        </div>
    );
}
