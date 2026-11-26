// (C) 2020-2026 GoodData Corporation

import { type ReactElement, type ReactNode, useLayoutEffect, useRef } from "react";

import cx from "classnames";

import { Item, UiTooltip } from "@gooddata/sdk-ui-kit";

import { type IInsightMenuItemButton } from "../../types.js";

const NON_TABBABLE_SELECTOR =
    "a[href], area[href], button, input, select, textarea, iframe, summary, [tabindex], [contenteditable]:not([contenteditable='false'])";

/**
 * The copy is only a text source for aria-describedby / screen readers. A link inside it
 * (e.g. "Create a destination") must not be a hidden Tab stop, otherwise Tab from the menu
 * lands on it instead of closing the menu.
 */
function DisabledReasonCopy({ id, children }: { id?: string; children: ReactNode }) {
    const ref = useRef<HTMLSpanElement>(null);

    // no dependency array: the tooltip content is a ReactNode that may change on any render
    useLayoutEffect(() => {
        ref.current
            ?.querySelectorAll<HTMLElement>(NON_TABBABLE_SELECTOR)
            .forEach((element) => element.setAttribute("tabindex", "-1"));
    });

    return (
        <span ref={ref} id={id} className="sr-only" aria-hidden={id ? true : undefined}>
            {children}
        </span>
    );
}

export const DashboardInsightMenuItemButton = (
    props: Omit<IInsightMenuItemButton, "type"> & {
        submenu?: boolean;
        /**
         * Id for the element holding the disabled reason. When set, the menu item references it with
         * aria-describedby, so the reason is rendered once as the description and kept out of the name.
         */
        descriptionId?: string;
    },
) => {
    const {
        itemName,
        itemId,
        disabled,
        icon,
        onClick,
        tooltip,
        isFocused,
        className,
        submenu = false,
        descriptionId,
    } = props;

    // for JSX icons we need an extra gd-icon-wrapper class to align the icon and the text vertically
    return renderButtonWithTooltip(
        <Item
            className={className}
            testId={itemId}
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            subMenu={submenu}
        >
            <span className={cx({ "gd-icon-wrapper": icon && typeof icon !== "string" })}>
                {icon ? typeof icon === "string" ? <i aria-hidden className={icon} /> : icon : null}
                {itemName}
            </span>
        </Item>,
        disabled,
        tooltip,
        isFocused,
        descriptionId,
    );
};

function renderButtonWithTooltip(
    button: ReactElement,
    disabled?: boolean,
    tooltip?: string | ReactNode,
    isFocused?: boolean,
    descriptionId?: string,
) {
    if (tooltip && disabled) {
        return (
            <>
                <UiTooltip
                    triggerBy={isFocused ? [] : ["hover", "focus"]}
                    arrowPlacement="left"
                    optimalPlacement
                    content={tooltip}
                    anchor={button}
                    accessibilityHidden
                />
                {/* The only accessible copy of the disabled reason. With descriptionId it is the target
                    of the item's aria-describedby and hidden from the item's name content (a directly
                    referenced hidden element still provides the description); without it, it is
                    plain screen-reader text next to the item. */}
                <DisabledReasonCopy id={descriptionId}>{tooltip}</DisabledReasonCopy>
            </>
        );
    } else {
        return button;
    }
}
