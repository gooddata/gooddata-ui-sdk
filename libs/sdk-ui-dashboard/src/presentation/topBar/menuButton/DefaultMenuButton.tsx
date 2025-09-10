// (C) 2021-2025 GoodData Corporation

import React, { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import {
    Button,
    IAlignPoint,
    ItemsWrapper,
    Overlay,
    SingleSelectListItem,
    UiFocusManager,
    UiTooltip,
    getFocusableElements,
    isActionKey,
    makeMenuKeyboardNavigation,
    useId,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";

import { DefaultSubmenuHeader } from "./DefaultSubmenuHeader.js";
import { IMenuButtonItem, IMenuButtonItemButton, IMenuButtonItemMenu, IMenuButtonProps } from "./types.js";
import { DEFAULT_MENU_BUTTON_ID } from "../../../_staging/accessibility/elementId.js";

const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];

/**
 * @alpha
 */
export function DefaultMenuButton(props: IMenuButtonProps): ReactElement | null {
    const { menuItems } = props;
    const [isOpen, setIsOpen] = useState(false);
    const [autofocusSubmenu, setAutofocusSubmenu] = useState(false);
    const intl = useIntl();
    const tooltipText = intl.formatMessage({ id: "controlButtons.options.tooltip" });
    const backLabel = intl.formatMessage({ id: "controlButtons.options.back" });
    const closeLabel = intl.formatMessage({ id: "controlButtons.options.closeMenu" });
    const menuWrapperRef = useRef<HTMLDivElement>(null);
    const [parentItemId, setParentItemId] = useState<string | null>(null);
    const menuItemRefs = useRef<Map<string, HTMLElement>>(new Map());

    const setMenuItemRef = useCallback(
        (itemId: string) => (element: HTMLDivElement | HTMLButtonElement | null) => {
            if (element) {
                menuItemRefs.current.set(itemId, element);
            } else {
                menuItemRefs.current.delete(itemId);
            }
        },
        [],
    );

    // generate unique IDs for accessibility and dropdown positioning
    const id = useId();
    const menuId = `menu-${id}`;
    const dropdownAnchorClassName = `dash-header-options-anchor-${id}`;

    const onMenuButtonClick = useCallback(() => {
        setIsOpen((prevIsOpen) => !prevIsOpen);
        setSelectedMenuItem(null);
    }, []);

    const onClose = useCallback(() => {
        setIsOpen(false);
        setSelectedMenuItem(null);
        setParentItemId(null);
        setAutofocusSubmenu(false);
    }, []);

    const openSubmenu = useCallback((menuItem: IMenuButtonItemMenu) => {
        setAutofocusSubmenu(true);
        setParentItemId(menuItem.itemId);
        setSelectedMenuItem(menuItem);
    }, []);

    const closeSubmenu = useCallback(() => {
        //parentItemId is set to null later in effect focusing parent item
        setSelectedMenuItem(null);
        setAutofocusSubmenu(true);
    }, []);

    const [selectedMenuItem, setSelectedMenuItem] = useState<IMenuButtonItemMenu | null>(null);
    const visibleMenuItems = useMemo(
        () => (selectedMenuItem?.items ?? menuItems).filter((item) => item.visible !== false),
        [menuItems, selectedMenuItem],
    );

    const menuKeyboardNavigationHandler = makeMenuKeyboardNavigation({
        onFocusFirst: () => {
            if (menuWrapperRef.current) {
                const { firstElement } = getFocusableElements(menuWrapperRef.current);
                firstElement?.focus();
            }
        },
        onFocusNext: () => {
            const elements = Array.from(menuItemRefs.current.values());
            const currentIndex = elements.indexOf(document.activeElement as HTMLElement);
            const nextElement =
                currentIndex === elements.length - 1 ? elements[0] : elements[currentIndex + 1];

            nextElement?.focus();
        },
        onFocusPrevious: () => {
            const elements = Array.from(menuItemRefs.current.values());
            const currentIndex = elements.indexOf(document.activeElement as HTMLElement);
            const previousElement =
                currentIndex <= 0 ? elements[elements.length - 1] : elements[currentIndex - 1];

            previousElement?.focus();
        },
        onClose,
        onLeaveLevel(event) {
            const [_itemId, targetItem] =
                Array.from(menuItemRefs.current.entries()).find(([_, element]) => element === event.target) ||
                [];
            if (targetItem?.role === "menuitem" && parentItemId) {
                closeSubmenu();
            }
        },
        onEnterLevel(event) {
            const [itemId] =
                Array.from(menuItemRefs.current.entries()).find(([_, element]) => element === event.target) ||
                [];
            const menuItem = visibleMenuItems.find((item) => item.itemId === itemId);
            if (menuItem?.type === "menu") {
                openSubmenu(menuItem);
            }
        },
        onUnhandledKeyDown(event) {
            if (isActionKey(event as unknown as React.KeyboardEvent)) {
                //onSelect by keyboard is handled by the menu item itself
                return;
            }

            event.stopPropagation();
            event.preventDefault();
            if (!selectedMenuItem || event.key !== "Tab" || !menuWrapperRef.current) {
                return;
            }
            const { focusableElements } = getFocusableElements(menuWrapperRef.current);
            let currentIndex = Array.from(focusableElements).indexOf(document.activeElement as HTMLElement);
            let nextElement;

            const isMenuItemExceptTheFirstOne = (element: HTMLElement) =>
                element.getAttribute("role") === "menuitem" &&
                element !== Array.from(menuItemRefs.current.values())[0];

            const getNextElementIndex = (currentIndex: number, isShiftKey: boolean) => {
                if (isShiftKey) {
                    return currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
                }
                return (currentIndex + 1) % focusableElements.length;
            };

            do {
                currentIndex = getNextElementIndex(currentIndex, event.shiftKey);
                nextElement = focusableElements[currentIndex];
            } while (isMenuItemExceptTheFirstOne(nextElement));

            nextElement?.focus();
        },
    });

    useEffect(() => {
        if (autofocusSubmenu && selectedMenuItem) {
            const firstElement = Array.from(menuItemRefs.current.values())[0];
            firstElement?.focus();
            setAutofocusSubmenu(false);
        }
        if (autofocusSubmenu && !selectedMenuItem && parentItemId) {
            const element = menuItemRefs.current.get(parentItemId);
            if (element) {
                element.focus();
            }
            setAutofocusSubmenu(false);
            setParentItemId(null);
        }
    }, [selectedMenuItem, parentItemId, menuItemRefs, autofocusSubmenu]);

    if (!visibleMenuItems.length) {
        if (!menuItems.length) {
            // only warn if the items were really empty before filtering
            console.warn(
                "DefaultMenuButton rendered without menu items. Make sure you are passing some items there.",
            );
        }

        return null;
    }

    const renderMenuItems = () => {
        return (
            <Overlay
                key={"topBarMenuButton"}
                alignTo={`.${dropdownAnchorClassName}`}
                alignPoints={overlayAlignPoints}
                className="gd-header-menu-overlay"
                closeOnMouseDrag={true}
                closeOnOutsideClick={true}
                onClose={onMenuButtonClick}
            >
                <UiFocusManager enableAutofocus enableFocusTrap enableReturnFocusOnUnmount>
                    <div onKeyDown={menuKeyboardNavigationHandler}>
                        <ItemsWrapper smallItemsSpacing className="gd-menu" wrapperRef={menuWrapperRef}>
                            {selectedMenuItem ? (
                                <DefaultSubmenuHeader
                                    title={selectedMenuItem.itemName}
                                    backLabel={backLabel}
                                    closeLabel={closeLabel}
                                    onClose={onClose}
                                    onGoBack={() => {
                                        setAutofocusSubmenu(true);
                                        setSelectedMenuItem(null);
                                    }}
                                />
                            ) : null}
                            <div role={"menu"} id={menuId} aria-labelledby={DEFAULT_MENU_BUTTON_ID}>
                                {visibleMenuItems.map((menuItem) => {
                                    return (
                                        <MenuItem
                                            key={menuItem.itemId}
                                            menuItem={menuItem}
                                            selectedMenuItem={selectedMenuItem}
                                            setMenuItemRef={setMenuItemRef}
                                            setSelectedMenuItem={setSelectedMenuItem}
                                            setParentItemId={setParentItemId}
                                            setAutofocusSubmenu={setAutofocusSubmenu}
                                            setIsOpen={setIsOpen}
                                        />
                                    );
                                })}
                            </div>
                        </ItemsWrapper>
                    </div>
                </UiFocusManager>
            </Overlay>
        );
    };

    return (
        <>
            <UiTooltip
                arrowPlacement="top-end"
                content={tooltipText}
                anchor={
                    <Button
                        onClick={onMenuButtonClick}
                        value="&#8943;"
                        id={DEFAULT_MENU_BUTTON_ID}
                        className={cx(
                            "gd-button-primary dash-header-options-button s-header-options-button gd-button",
                            dropdownAnchorClassName,
                        )}
                        accessibilityConfig={{
                            ariaLabel: tooltipText,
                            role: "button",
                            isExpanded: isOpen,
                            popupId: menuId,
                        }}
                    />
                }
                triggerBy={["hover", "focus"]}
            />

            {isOpen ? renderMenuItems() : null}
        </>
    );
}

interface IMenuItemProps {
    menuItem: IMenuButtonItem;
    selectedMenuItem: IMenuButtonItem | null;
    setMenuItemRef: (itemId: string) => (element: HTMLDivElement | HTMLButtonElement | null) => void;
    setSelectedMenuItem: (menuItem: IMenuButtonItemMenu | null) => void;
    setParentItemId: (itemId: string | null) => void;
    setAutofocusSubmenu: (autofocusSubmenu: boolean) => void;
    setIsOpen: (isOpen: boolean) => void;
}

function MenuItem({
    menuItem,
    selectedMenuItem,
    setMenuItemRef,
    setSelectedMenuItem,
    setParentItemId,
    setAutofocusSubmenu,
    setIsOpen,
}: IMenuItemProps) {
    const tooltipId = useIdPrefixed(`menu-tooltip-${menuItem.itemId}`);

    const renderWithOptionalTooltip = (
        menuItem: IMenuButtonItemButton | IMenuButtonItemMenu,
        children: (data: { selectorClassName: string; tooltipId?: string }) => ReactElement,
    ) => {
        const selectorClassName = `gd-menu-item-${menuItem.itemId}`;
        const hasTooltip = !!menuItem.tooltip;

        const element = children({
            selectorClassName,
            tooltipId: hasTooltip ? tooltipId : undefined,
        });

        if (!hasTooltip) {
            return element;
        }

        return (
            <UiTooltip
                id={tooltipId}
                triggerBy={["hover", "focus"]}
                arrowPlacement="right"
                optimalPlacement
                content={menuItem.tooltip}
                anchor={element}
            />
        );
    };

    if (menuItem.type === "separator") {
        return (
            <SingleSelectListItem
                key={menuItem.itemId}
                type={menuItem.type}
                className={menuItem.className}
                accessibilityConfig={{
                    role: "separator",
                }}
            />
        );
    }
    if (menuItem.type === "header") {
        return (
            <SingleSelectListItem
                ref={setMenuItemRef(menuItem.itemId)}
                key={menuItem.itemId}
                type={menuItem.type}
                title={menuItem.itemName}
                className={menuItem.className}
                accessibilityConfig={{
                    role: "presentation",
                }}
            />
        );
    }

    if (menuItem.type === "menu") {
        return renderWithOptionalTooltip(menuItem, ({ selectorClassName, tooltipId }) => (
            <SingleSelectListItem
                ref={setMenuItemRef(menuItem.itemId)}
                className={cx("gd-menu-item", menuItem.className, `s-${menuItem.itemId}`, {
                    [selectorClassName]: menuItem.tooltip,
                    "is-disabled": menuItem.disabled,
                })}
                key={menuItem.itemId}
                title={menuItem.itemName}
                icon={menuItem.icon}
                isMenu={true}
                onClick={
                    menuItem.disabled
                        ? undefined
                        : () => {
                              setAutofocusSubmenu(true);
                              setParentItemId(menuItem.itemId);
                              setSelectedMenuItem(menuItem);
                          }
                }
                elementType="button"
                accessibilityConfig={{
                    role: "menuitem",
                    ariaHasPopup: "menu",
                    ariaExpanded: selectedMenuItem?.itemId === menuItem.itemId,
                    ariaDisabled: menuItem.disabled,
                    ariaDescribedBy: menuItem.disabled ? tooltipId : undefined,
                }}
            />
        ));
    }

    return renderWithOptionalTooltip(menuItem, ({ selectorClassName, tooltipId }) => (
        <SingleSelectListItem
            ref={setMenuItemRef(menuItem.itemId)}
            className={cx("gd-menu-item", menuItem.className, `s-${menuItem.itemId}`, {
                [selectorClassName]: menuItem.tooltip,
                "is-disabled": menuItem.disabled,
            })}
            key={menuItem.itemId}
            title={menuItem.itemName}
            icon={menuItem.icon}
            onClick={
                menuItem.disabled
                    ? undefined
                    : () => {
                          menuItem.onClick?.();
                          setIsOpen(false);
                          setSelectedMenuItem(null);
                      }
            }
            elementType="button"
            accessibilityConfig={{
                role: "menuitem",
                ariaDisabled: menuItem.disabled,
                ariaHasPopup: menuItem.opensDialog ? "dialog" : undefined,
                ariaDescribedBy: menuItem.disabled ? tooltipId : undefined,
            }}
        />
    ));
}
