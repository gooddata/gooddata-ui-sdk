// (C) 2025 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, type ReactNode, useCallback } from "react";

import cx from "classnames";

import { ShortenedText } from "../../../../ShortenedText/ShortenedText.js";
import { UiTooltip } from "../../../UiTooltip/UiTooltip.js";
import { typedUiMenuContextStore } from "../../context.js";
import { e } from "../../menuBem.js";
import {
    type IUiMenuInteractiveItemProps,
    type IUiMenuInteractiveItemWrapperProps,
    type IUiMenuItemData,
} from "../../types.js";

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

    return (
        <li
            ref={scrollToItem}
            role="menuitem"
            {...item.ariaAttributes}
            aria-haspopup={item.subItems ? "menu" : item.ariaAttributes?.["aria-haspopup"]}
            aria-disabled={item.isDisabled}
            onMouseMove={handleMouseFocus}
            onClick={item.isDisabled ? undefined : handleSelect}
            tabIndex={-1}
            id={makeItemId(item)}
            className={classNames}
            data-testid={dataTestId}
        >
            <InteractiveItemComponent item={item} isFocused={isFocused} />
        </li>
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
        />
    );
}
