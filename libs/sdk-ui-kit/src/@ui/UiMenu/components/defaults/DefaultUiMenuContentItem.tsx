// (C) 2025 GoodData Corporation

import { KeyboardEvent, MouseEvent, ReactElement, ReactNode, memo, useCallback } from "react";

import cx from "classnames";

import { ShortenedText } from "../../../../ShortenedText/index.js";
import { typedUiMenuContextStore } from "../../context.js";
import { e } from "../../menuBem.js";
import { IUiMenuContentItemProps, IUiMenuContentItemWrapperProps, IUiMenuItemData } from "../../types.js";
/**
 * Default component for rendering content menu items.
 * @internal
 */
export const DefaultUiMenuContentItemWrapper = memo(function DefaultUiMenuContentItemWrapper<
    T extends IUiMenuItemData = object,
>({ item }: IUiMenuContentItemWrapperProps<T>): ReactElement {
    const { useContextStore, createSelector } = typedUiMenuContextStore<T>();
    const selector = createSelector((ctx) => ({
        onSelect: ctx.onSelect,
        controlType: ctx.controlType,
        scrollToView: ctx.scrollToView,
        setFocusedId: ctx.setFocusedId,
        makeItemId: ctx.makeItemId,
        itemClassName: ctx.itemClassName,
        itemDataTestId: ctx.itemDataTestId,
        ContentItemComponent: ctx.ContentItem,
        isFocused: ctx.focusedItem?.id === item.id,
    }));

    const {
        scrollToView,
        controlType,
        setFocusedId,
        onSelect,
        makeItemId,
        itemClassName,
        itemDataTestId,
        ContentItemComponent,
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
        }),
        typeof itemClassName === "function" ? itemClassName(item) : itemClassName,
    );

    const dataTestId = typeof itemDataTestId === "function" ? itemDataTestId(item) : itemDataTestId;

    return (
        <li
            ref={scrollToItem}
            role="menuitem"
            aria-haspopup="dialog"
            className={classNames}
            tabIndex={-1}
            aria-disabled={item.isDisabled}
            id={makeItemId(item)}
            onMouseMove={handleMouseFocus}
            data-testid={dataTestId}
        >
            <ContentItemComponent item={item} isFocused={isFocused} onSelect={handleSelect} />
        </li>
    );
});

/**
 * @internal
 */
export function DefaultUiMenuContentItem<T extends IUiMenuItemData = object>({
    item,
    isFocused,
    onSelect,
}: IUiMenuContentItemProps<T>): ReactNode {
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

            {!!item.Component && <i className="gd-icon-navigateright" />}
        </div>
    );
}
