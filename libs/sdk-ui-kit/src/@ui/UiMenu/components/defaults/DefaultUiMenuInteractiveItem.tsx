// (C) 2025 GoodData Corporation

import React from "react";
import { e } from "../../menuBem.js";
import { ShortenedText } from "../../../../ShortenedText/index.js";
import {
    IUiMenuItemData,
    IUiMenuInteractiveItemProps,
    IUiMenuInteractiveItemWrapperProps,
} from "../../types.js";
import { typedUiMenuContextStore } from "../../context.js";
import cx from "classnames";

/**
 * @internal
 */
export function DefaultUiMenuInteractiveItemWrapper<T extends IUiMenuItemData = object>({
    item,
}: IUiMenuInteractiveItemWrapperProps<T>): React.ReactNode {
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

    const handleMouseFocus = React.useCallback(() => {
        if (controlType !== "mouse") {
            return;
        }
        setFocusedId(item.id);
    }, [controlType, item.id, setFocusedId]);

    const handleSelect = React.useCallback(() => {
        if (item.isDisabled) {
            return;
        }

        onSelect(item);
    }, [item, onSelect]);

    const classNames = cx(
        e("item-wrapper", {
            isFocused,
            isDisabled: !!item.isDisabled,
        }),
        typeof itemClassName === "function" ? itemClassName(item) : itemClassName,
    );

    const dataTestId = typeof itemDataTestId === "function" ? itemDataTestId(item) : itemDataTestId;

    return (
        <li
            ref={scrollToItem}
            role="menuitem"
            aria-haspopup={item.subItems ? "menu" : undefined}
            aria-disabled={item.isDisabled}
            onMouseMove={handleMouseFocus}
            tabIndex={-1}
            id={makeItemId(item)}
            className={classNames}
            data-testid={dataTestId}
        >
            <InteractiveItemComponent item={item} isFocused={isFocused} onSelect={handleSelect} />
        </li>
    );
}

/**
 * @internal
 */
export function DefaultUiMenuInteractiveItem<T extends IUiMenuItemData = object>({
    item,
    isFocused,
    onSelect,
    size = "medium",
}: IUiMenuInteractiveItemProps<T>): React.ReactNode {
    return (
        <div
            className={e("item", {
                isFocused,
                isSelected: !!item.isSelected,
                isDisabled: !!item.isDisabled,
                size,
            })}
            onClick={onSelect}
        >
            <ShortenedText className={e("item-title")} ellipsisPosition={"end"}>
                {item.stringTitle}
            </ShortenedText>

            {!!item.subItems && <i className="gd-icon-navigateright" />}
        </div>
    );
}
