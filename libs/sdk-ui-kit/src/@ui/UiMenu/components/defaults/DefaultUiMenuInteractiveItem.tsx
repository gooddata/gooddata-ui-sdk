// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, type ReactNode, useCallback, useState } from "react";

import cx from "classnames";

import { ShortenedText } from "../../../../ShortenedText/ShortenedText.js";
import { useCloseOnEscape } from "../../../hooks/useCloseOnEscape.js";
import { UiTooltip } from "../../../UiTooltip/UiTooltip.js";
import { typedUiMenuContextStore } from "../../context.js";
import { e } from "../../menuBem.js";
import {
    type IUiMenuInteractiveItem,
    type IUiMenuInteractiveItemProps,
    type IUiMenuInteractiveItemWrapperProps,
    type IUiMenuItemData,
} from "../../types.js";

function hasIconTooltip(item: { tooltip?: ReactNode; iconRight?: ReactNode }): boolean {
    return !!item.tooltip && !!item.iconRight;
}

function getItemRole(
    selectionRole: IUiMenuInteractiveItem["selectionRole"],
): "menuitem" | "menuitemradio" | "menuitemcheckbox" {
    switch (selectionRole) {
        case "radio":
            return "menuitemradio";
        case "checkbox":
            return "menuitemcheckbox";
        default:
            return "menuitem";
    }
}

/**
 * @internal
 */
export function DefaultUiMenuInteractiveItemWrapper<T extends IUiMenuItemData = object>({
    item,
    Component,
}: IUiMenuInteractiveItemWrapperProps<T>): ReactNode {
    const { useContextStore, createSelector } = typedUiMenuContextStore<T>();
    const selector = createSelector((ctx) => ({
        onSelect: ctx.onSelect,
        controlType: ctx.controlType,
        scrollToView: ctx.scrollToView,
        setFocusedId: ctx.setFocusedId,
        makeItemId: ctx.makeItemId,
        itemClassName: ctx.itemClassName,
        itemDataTestId: ctx.itemDataTestId,
        InteractiveItemComponent: ctx.InteractiveItem,
        isFocused: ctx.focusedItem?.id === item.id,
        isMenuFocusVisible: ctx.isMenuFocusVisible,
    }));

    const {
        onSelect,
        scrollToView,
        controlType,
        setFocusedId,
        makeItemId,
        itemClassName,
        itemDataTestId,
        InteractiveItemComponent,
        isFocused,
        isMenuFocusVisible,
    } = useContextStore(selector);

    const scrollToItem = (element: HTMLLIElement | null) => {
        if (!element || !isFocused) {
            return;
        }

        scrollToView(element);
    };

    // Same real :focus-visible signal the focus-ring CSS uses (UiMenu.scss) — the only reliable
    // way to tell keyboard from pointer focus, since aria-activedescendant alone can't.
    const isKeyboardFocused = isFocused && isMenuFocusVisible;

    // Escape dismisses just this item's tooltip, not the whole menu - reset (during render, no
    // effect needed) once focus moves away. Gated on item.tooltip so Escape on a plain item still
    // closes the menu on the first press.
    const [isDismissed, setIsDismissed] = useState(false);
    const [wasKeyboardFocused, setWasKeyboardFocused] = useState(isKeyboardFocused);
    if (isKeyboardFocused !== wasKeyboardFocused) {
        setWasKeyboardFocused(isKeyboardFocused);
        if (!isKeyboardFocused) {
            setIsDismissed(false);
        }
    }
    const isTooltipOpen = !!item.tooltip && isKeyboardFocused && !isDismissed;
    useCloseOnEscape(isTooltipOpen && !hasIconTooltip(item), () => setIsDismissed(true), true);

    const handleMouseFocus = useCallback(() => {
        if (controlType !== "mouse") {
            return;
        }
        setFocusedId(item.id);
    }, [controlType, item.id, setFocusedId]);

    const handleSelect = useCallback(
        (e: MouseEvent | KeyboardEvent) => {
            if (item.isDisabled) {
                return;
            }

            onSelect(item, e);
        },
        [item, onSelect],
    );

    const classNames = cx(
        e("item-wrapper", {
            isFocused,
            isDisabled: !!item.isDisabled,
            isDestructive: !!item.isDestructive,
        }),
        typeof itemClassName === "function" ? itemClassName(item) : itemClassName,
    );

    const dataTestId = typeof itemDataTestId === "function" ? itemDataTestId(item) : itemDataTestId;

    return (
        <li
            ref={scrollToItem}
            {...item.ariaAttributes}
            role={getItemRole(item.selectionRole)}
            aria-checked={item.selectionRole ? !!item.isSelected : item.ariaAttributes?.["aria-checked"]}
            aria-haspopup={item.subItems ? "menu" : item.ariaAttributes?.["aria-haspopup"]}
            aria-disabled={item.isDisabled}
            aria-label={item.ariaAttributes?.["aria-label"]}
            onMouseMove={handleMouseFocus}
            onClick={item.isDisabled ? undefined : handleSelect}
            tabIndex={-1}
            id={makeItemId(item)}
            className={classNames}
            data-testid={dataTestId}
        >
            {Component ? (
                <Component item={item} isFocused={isFocused} isTooltipOpen={isTooltipOpen} />
            ) : (
                <InteractiveItemComponent item={item} isFocused={isFocused} isTooltipOpen={isTooltipOpen} />
            )}
        </li>
    );
}

/**
 * @internal
 */
export function DefaultUiMenuInteractiveItem<T extends IUiMenuItemData = object>({
    item,
    isFocused,
    isTooltipOpen,
}: IUiMenuInteractiveItemProps<T>): ReactNode {
    const useIconTooltip = hasIconTooltip(item);

    const itemInner = (
        <div
            className={e("item", {
                isFocused,
                isSelected: !!item.isSelected,
                isDisabled: !!item.isDisabled,
                isDestructive: !!item.isDestructive,
            })}
        >
            {item.iconLeft ? item.iconLeft : null}
            <ShortenedText className={e("item-title")} ellipsisPosition={"end"}>
                {item.stringTitle}
            </ShortenedText>

            {!!item.subItems && <i className="gd-icon-navigateright" />}
            {useIconTooltip ? (
                <UiTooltip
                    anchor={item.iconRight}
                    content={item.tooltip}
                    optimalPlacement
                    triggerBy={["hover"]}
                    inlineAnchor
                    accessibilityHidden
                    arrowPlacement="bottom-end"
                    width={item.tooltipWidth}
                />
            ) : item.iconRight ? (
                item.iconRight
            ) : null}
            {item.tooltip ? <span className="sr-only">{item.tooltip}</span> : null}
        </div>
    );

    if (!item.tooltip) {
        return itemInner;
    }

    return (
        <UiTooltip
            anchor={itemInner}
            content={item.tooltip}
            optimalPlacement
            isOpen={useIconTooltip ? isTooltipOpen : isTooltipOpen || undefined}
            triggerBy={useIconTooltip ? [] : ["hover"]}
            accessibilityHidden
            arrowPlacement="left"
            width={item.tooltipWidth}
        />
    );
}
