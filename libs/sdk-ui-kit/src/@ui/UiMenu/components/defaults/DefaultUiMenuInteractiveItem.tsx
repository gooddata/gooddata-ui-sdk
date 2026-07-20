// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, type ReactNode, useCallback } from "react";

import cx from "classnames";

import { ShortenedText } from "../../../../ShortenedText/ShortenedText.js";
import { UiTooltip } from "../../../UiTooltip/UiTooltip.js";
import { typedUiMenuContextStore } from "../../context.js";
import { e } from "../../menuBem.js";
import {
    type IUiMenuInteractiveItem,
    type IUiMenuInteractiveItemProps,
    type IUiMenuInteractiveItemWrapperProps,
    type IUiMenuItemData,
} from "../../types.js";

function getTooltipId<T extends IUiMenuItemData = object>(
    item: IUiMenuInteractiveItem<T>,
    makeItemId: (item: IUiMenuInteractiveItem<T>) => string | undefined,
): string | undefined {
    const itemId = makeItemId(item);
    return item.tooltip && itemId ? `${itemId}__tooltip` : undefined;
}

/**
 * @internal
 */
export function DefaultUiMenuInteractiveItemWrapper<T extends IUiMenuItemData = object>({
    item,
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
    } = useContextStore(selector);

    const scrollToItem = (element: HTMLLIElement | null) => {
        if (!element || !isFocused) {
            return;
        }

        scrollToView(element);
    };

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
    const tooltipId = getTooltipId(item, makeItemId);

    return (
        <>
            <li
                ref={scrollToItem}
                role="menuitem"
                {...item.ariaAttributes}
                aria-haspopup={item.subItems ? "menu" : item.ariaAttributes?.["aria-haspopup"]}
                aria-disabled={item.isDisabled}
                aria-describedby={
                    [tooltipId, item.ariaAttributes?.["aria-describedby"]].filter(Boolean).join(" ") ||
                    undefined
                }
                onMouseMove={handleMouseFocus}
                onClick={item.isDisabled ? undefined : handleSelect}
                tabIndex={-1}
                id={makeItemId(item)}
                className={classNames}
                data-testid={dataTestId}
            >
                <InteractiveItemComponent item={item} isFocused={isFocused} />
            </li>
            {/*
                Sibling of the <li>, not a descendant — so this text is exposed via aria-describedby
                without also being folded into the <li>'s accessible NAME (which is computed from its
                own descendant content). Rendered statically (not gated on UiTooltip's hover/focus-driven
                open state) so aria-describedby always resolves to real content, matching the pattern in
                MeasureValueFilterDropdownActions.tsx. Wrapped in a role="none" <li> (rather than a bare
                <span>) so it stays valid content inside the enclosing <menu>/<ul>.
            */}
            {tooltipId ? (
                <li role="none" className="sr-only">
                    <span id={tooltipId}>{item.tooltip}</span>
                </li>
            ) : null}
        </>
    );
}

/**
 * @internal
 */
export function DefaultUiMenuInteractiveItem<T extends IUiMenuItemData = object>({
    item,
    isFocused,
}: IUiMenuInteractiveItemProps<T>): ReactNode {
    return (
        <UiTooltip
            anchor={
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
                    {item.iconRight ? item.iconRight : null}
                </div>
            }
            content={item.tooltip}
            disabled={!item.tooltip}
            optimalPlacement
            triggerBy={["hover"]}
            arrowPlacement={"left"}
            width={item.tooltipWidth}
            // The accessible description is provided by the dedicated sr-only <li> in
            // DefaultUiMenuInteractiveItemWrapper; suppress UiTooltip's own internal
            // screen-reader copy so its (hover-gated) text isn't also folded into this
            // menu item's accessible name as a descendant of the <li>.
            accessibilityHidden
        />
    );
}
