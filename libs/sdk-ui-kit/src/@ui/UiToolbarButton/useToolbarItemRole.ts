// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, useCallback, useContext } from "react";

import { isActionKey } from "../../utils/events.js";
import { UiToolbarSegmentedControlContext } from "../UiToolbarSegmentedControl/context.js";

export interface IToolbarItemRoleInput {
    value?: string;
    isSelected?: boolean;
    isDisabled?: boolean;
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

/**
 * True for the keys an enclosing dropdown wrapper reacts to: the activation keys plus the vertical
 * arrows that open and close its popup.
 */
export function isPopupKey(event: KeyboardEvent<HTMLElement>): boolean {
    return isActionKey(event) || event.code === "ArrowDown" || event.code === "ArrowUp";
}

export interface IToolbarItemRoleButtonProps {
    role?: "radio";
    "aria-checked"?: boolean;
    "aria-pressed"?: boolean;
    "aria-disabled"?: true;
    "data-value"?: string;
    onClick: (event: MouseEvent<HTMLButtonElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

export interface IToolbarItemRoleResult {
    isChecked: boolean;
    isDisabled: boolean;
    buttonProps: IToolbarItemRoleButtonProps;
}

/**
 * Button attributes of a toolbar item. Inside a segmented control the item is a radio; elsewhere it
 * is a toggle button when `isSelected` is given.
 *
 * Disabled items use `aria-disabled` instead of `disabled` so they stay reachable with arrow keys.
 * No tabIndex is rendered: a toolbar or a group writes the roving tabindex into the DOM, and an item
 * rendered through a portal keeps the browser default. React only rewrites the attribute when the
 * prop changes, so leaving it out is what keeps the DOM writes in place.
 */
export function useToolbarItemRole({
    value,
    isSelected,
    isDisabled: isDisabledProp,
    onClick,
    onKeyDown,
}: IToolbarItemRoleInput): IToolbarItemRoleResult {
    const group = useContext(UiToolbarSegmentedControlContext);

    const isRadio = group !== null;
    const isChecked = isRadio ? value !== undefined && group.value === value : !!isSelected;
    const isDisabled = !!isDisabledProp || (group?.isDisabled ?? false);

    const handleClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            if (isDisabled) {
                event.preventDefault();
                return;
            }
            // Both run by design: the group owns selection, the item keeps its own click handler for
            // whatever else the consumer hangs off the same press.
            if (isRadio && value !== undefined) {
                group.onChange(value, event);
            }
            onClick?.(event);
        },
        [group, isDisabled, isRadio, onClick, value],
    );

    // A disabled item uses aria-disabled, so it still receives key events. The keys an enclosing
    // dropdown wrapper reacts to are swallowed here so it cannot open its popup; horizontal arrows
    // still bubble to the toolbar. A radio keeps the vertical arrows: they navigate its group.
    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLButtonElement>) => {
            if (isDisabled) {
                if (isRadio ? isActionKey(event) : isPopupKey(event)) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                return;
            }
            onKeyDown?.(event);
        },
        [isDisabled, isRadio, onKeyDown],
    );

    // Only defined keys are returned so a spread never clears attributes set before it.
    const buttonProps: IToolbarItemRoleButtonProps = { onClick: handleClick, onKeyDown: handleKeyDown };
    if (isRadio) {
        buttonProps.role = "radio";
        buttonProps["aria-checked"] = isChecked;
    } else if (isSelected !== undefined) {
        buttonProps["aria-pressed"] = isSelected;
    }
    if (isDisabled) {
        buttonProps["aria-disabled"] = true;
    }
    if (value !== undefined) {
        buttonProps["data-value"] = value;
    }

    return { isChecked, isDisabled, buttonProps };
}
