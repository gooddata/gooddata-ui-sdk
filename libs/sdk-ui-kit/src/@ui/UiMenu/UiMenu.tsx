// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent, type ReactNode, type RefObject, useEffect, useMemo, useRef } from "react";

import cx from "classnames";

import { typedUiMenuContextStore } from "./context.js";
import { useCustomContentKeyNavigation, useKeyNavigation, useUiMenuContextValue } from "./hooks.js";
import { getContentItem, getSiblingItems } from "./itemUtils.js";
import { b, e } from "./menuBem.js";
import { type IUiMenuItemData, type IUiMenuProps } from "./types.js";
import { UiAutofocus } from "../UiFocusManager/UiAutofocus.js";

function ContentWrapper(props: {
    keyboardNavigationHandler: (event: KeyboardEvent) => void;
    children?: ReactNode;
}) {
    return (
        // autofocus always first element in the custom content for now
        <UiAutofocus>
            <div onKeyDown={props.keyboardNavigationHandler}>{props.children}</div>
        </UiAutofocus>
    );
}

/**
 * An accessible menu component that can be navigated by keyboard.
 * Usable in a <Dropdown /> component.
 * Should implement https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 *
 * @internal
 */
export function UiMenu<T extends IUiMenuItemData = object, M extends object = object>(
    props: IUiMenuProps<T, M>,
): ReactNode {
    const {
        size = "medium",
        dataTestId,
        maxWidth,
        maxHeight,
        ariaAttributes,
        onUnhandledKeyDown,
        shouldKeyboardActionPreventDefault,
        shouldKeyboardActionStopPropagation,
        containerBottomPadding = "none",
        containerTopPadding = "none",
    } = props;

    const menuComponentRef = useRef<HTMLMenuElement>(null);
    const itemsContainerRef = useRef<HTMLDivElement>(null);

    const UiMenuContextStore = typedUiMenuContextStore<T, M>();
    const contextStoreValue = useUiMenuContextValue(
        props,
        menuComponentRef as RefObject<HTMLElement>,
        itemsContainerRef as RefObject<HTMLElement>,
    );

    const handleKeyDown = useKeyNavigation<T, M>({
        menuContextValue: contextStoreValue,
        onUnhandledKeyDown,
        shouldKeyboardActionPreventDefault,
        shouldKeyboardActionStopPropagation,
    });

    const handleKeyDownInCustomContent = useCustomContentKeyNavigation<T, M>({
        menuContextValue: contextStoreValue,
        onUnhandledKeyDown,
        shouldKeyboardActionPreventDefault,
        shouldKeyboardActionStopPropagation,
    });

    const {
        focusedItem,
        items,
        controlType,
        setControlType,
        MenuHeader,
        ItemComponent,
        Content,
        makeItemId,
        shownCustomContentItemId,
    } = contextStoreValue;
    const focusedId = focusedItem?.id;

    const currentMenuLevelItems = useMemo(
        () => (focusedId === undefined ? [] : (getSiblingItems(items, focusedId) ?? [])),
        [items, focusedId],
    );

    useEffect(() => {
        // Only focus when shownCustomContentItemId becomes undefined (was previously set)
        if (shownCustomContentItemId === undefined && menuComponentRef.current) {
            menuComponentRef.current.focus();
        }
    }, [shownCustomContentItemId, menuComponentRef]);

    const menuDataTestId = typeof dataTestId === "function" ? dataTestId(contextStoreValue) : dataTestId;
    const maxHeightValue = typeof maxHeight === "function" ? maxHeight(contextStoreValue) : maxHeight;

    return (
        <UiMenuContextStore value={contextStoreValue}>
            <div
                className={cx(b({ controlType, size }))}
                style={{ maxWidth, maxHeight: maxHeightValue }}
                onKeyDownCapture={() => setControlType("keyboard")}
                onMouseMoveCapture={() => setControlType("mouse")}
                data-testid={menuDataTestId}
            >
                {shownCustomContentItemId ? (
                    <ContentWrapper keyboardNavigationHandler={handleKeyDownInCustomContent}>
                        <Content item={getContentItem(items, shownCustomContentItemId)!} />
                    </ContentWrapper>
                ) : (
                    <>
                        <MenuHeader />
                        <div
                            className={e("items-container", {
                                "container-bottom-padding": containerBottomPadding,
                                "container-top-padding": containerTopPadding,
                            })}
                            ref={itemsContainerRef as RefObject<HTMLDivElement>}
                        >
                            <menu
                                className={e("items")}
                                tabIndex={0}
                                onKeyDown={handleKeyDown}
                                aria-activedescendant={focusedItem ? makeItemId(focusedItem) : undefined}
                                {...ariaAttributes}
                                role="menu"
                                ref={menuComponentRef}
                            >
                                {currentMenuLevelItems.map((item, index) => (
                                    <ItemComponent key={"id" in item ? item.id : index} item={item} />
                                ))}
                            </menu>
                        </div>
                    </>
                )}
            </div>
        </UiMenuContextStore>
    );
}
