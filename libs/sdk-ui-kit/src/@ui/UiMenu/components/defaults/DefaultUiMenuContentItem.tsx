// (C) 2025-2026 GoodData Corporation

import {
    type KeyboardEvent,
    type MouseEvent,
    type ReactElement,
    type ReactNode,
    memo,
    useCallback,
} from "react";

import cx from "classnames";

// The tooltip anchor wrapper defaults to fit-content; the title must be allowed to shrink and clip.
const TITLE_ANCHOR_STYLE = { display: "block", minWidth: 0, flex: "1 1 0%" } as const;

import { useIsTextTruncated } from "../../../hooks/useIsTextTruncated.js";
import { UiTooltip } from "../../../UiTooltip/UiTooltip.js";
import { typedUiMenuContextStore } from "../../context.js";
import { e } from "../../menuBem.js";
import {
    type IUiMenuContentItemProps,
    type IUiMenuContentItemWrapperProps,
    type IUiMenuItemData,
} from "../../types.js";
/**
 * Default component for rendering content menu items.
 * @internal
 */
export const DefaultUiMenuContentItemWrapper = memo<IUiMenuContentItemWrapperProps>(
    function DefaultUiMenuContentItemWrapper({ item }): ReactElement {
        const { useContextStore, createSelector } = typedUiMenuContextStore();
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
                onClick={item.isDisabled ? undefined : handleSelect}
                aria-disabled={item.isDisabled}
                id={makeItemId(item)}
                onMouseMove={handleMouseFocus}
                data-testid={dataTestId}
            >
                <ContentItemComponent item={item} isFocused={isFocused} />
            </li>
        );
    },
);

/**
 * @internal
 */
export function DefaultUiMenuContentItem<T extends IUiMenuItemData = object>({
    item,
    isFocused,
}: IUiMenuContentItemProps<T>): ReactNode {
    const title = useIsTextTruncated(item.stringTitle);
    const titleElement = (
        <span ref={title.ref} className={e("item-title")}>
            {item.stringTitle}
        </span>
    );

    return (
        <div
            className={e("item", {
                isFocused,
                isDisabled: !!item.isDisabled,
            })}
        >
            {item.iconLeft ? item.iconLeft : null}
            {title.isTruncated ? (
                <UiTooltip
                    anchor={titleElement}
                    content={item.stringTitle}
                    triggerBy={["hover"]}
                    accessibilityHidden
                    arrowPlacement="left"
                    optimalPlacement
                    offset={10}
                    component="span"
                    anchorWrapperStyles={TITLE_ANCHOR_STYLE}
                />
            ) : (
                titleElement
            )}

            {!!item.Component && <i className="gd-icon-navigateright" />}
        </div>
    );
}
