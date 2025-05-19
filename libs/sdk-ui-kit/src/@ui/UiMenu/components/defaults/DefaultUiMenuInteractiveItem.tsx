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
}: IUiMenuInteractiveItemProps<T>): React.ReactNode {
    return (
        <div
            className={e("item", {
                isFocused,
                isDisabled: !!item.isDisabled,
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
