// (C) 2025 GoodData Corporation
import React, { FC } from "react";

import cx from "classnames";

import { typedUiMenuContextStore } from "./context.js";
import { useCustomContentKeyNavigation, useKeyNavigation, useUiMenuContextValue } from "./hooks.js";
import { getContentItem, getSiblingItems } from "./itemUtils.js";
import { b, e } from "./menuBem.js";
import { IUiMenuItemData, UiMenuProps } from "./types.js";
import { UiAutofocus } from "../UiFocusManager/UiAutofocus.js";

const ContentWrapper: FC<{
    keyboardNavigationHandler: (event: React.KeyboardEvent) => void;
    children?: React.ReactNode;
}> = (props) => {
    return (
        // autofocus always first element in the custom content for now
        <UiAutofocus>
            <div onKeyDown={props.keyboardNavigationHandler}>{props.children}</div>
        </UiAutofocus>
    );
};

/**
 * An accessible menu component that can be navigated by keyboard.
 * Usable in a <Dropdown /> component.
 * Should implement https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 *
 * @internal
 */
export function UiMenu<T extends IUiMenuItemData = object, M extends object = object>(
    props: UiMenuProps<T, M>,
): React.ReactNode {
    const {
        dataTestId,
        maxWidth,
        maxHeight,
        ariaAttributes,
        onUnhandledKeyDown,
        shouldKeyboardActionPreventDefault,
        shouldKeyboardActionStopPropagation,
        containerBottomPadding = "none",
    } = props;

    const menuComponentRef = React.useRef<HTMLMenuElement>(null);
    const itemsContainerRef = React.useRef<HTMLDivElement>(null);

    const UiMenuContextStore = typedUiMenuContextStore<T, M>();
    const contextStoreValue = useUiMenuContextValue(props, menuComponentRef, itemsContainerRef);

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

    const currentMenuLevelItems = React.useMemo(
        () => (focusedId === undefined ? [] : (getSiblingItems(items, focusedId) ?? [])),
        [items, focusedId],
    );

    React.useEffect(() => {
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
                className={cx(b(), b({ controlType }))}
                style={{ maxWidth, maxHeight: maxHeightValue }}
                onKeyDownCapture={() => setControlType("keyboard")}
                onMouseMoveCapture={() => setControlType("mouse")}
                data-testid={menuDataTestId}
            >
                {shownCustomContentItemId ? (
                    <ContentWrapper keyboardNavigationHandler={handleKeyDownInCustomContent}>
                        <Content item={getContentItem(items, shownCustomContentItemId)} />
                    </ContentWrapper>
                ) : (
                    <>
                        <MenuHeader />
                        <div
                            className={e("items-container", {
                                "container-bottom-padding": containerBottomPadding,
                            })}
                            ref={itemsContainerRef as React.MutableRefObject<HTMLDivElement>}
                        >
                            <menu
                                className={e("items")}
                                tabIndex={0}
                                onKeyDown={handleKeyDown}
                                aria-activedescendant={makeItemId(focusedItem)}
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
