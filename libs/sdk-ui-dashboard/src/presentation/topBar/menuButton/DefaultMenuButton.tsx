// (C) 2021-2025 GoodData Corporation
import React, { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import cx from "classnames";
import {
    Bubble,
    BubbleHoverTrigger,
    Button,
    IAlignPoint,
    ItemsWrapper,
    Overlay,
    SingleSelectListItem,
    UiFocusTrap,
    getFocusableElements,
    useId,
    makeMenuKeyboardNavigation,
} from "@gooddata/sdk-ui-kit";
import { useIntl } from "react-intl";

import { IMenuButtonItemButton, IMenuButtonItemMenu, IMenuButtonProps } from "./types.js";
import { DefaultSubmenuHeader } from "./DefaultSubmenuHeader.js";
const ALIGN_POINTS_TOOLTIP = [{ align: "bc tr" }, { align: "cl cr" }];
const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];
const bubbleAlignPoints: IAlignPoint[] = [{ align: "cl tr" }];

/**
 * @alpha
 */
export const DefaultMenuButton = (props: IMenuButtonProps): JSX.Element | null => {
    const { menuItems } = props;
    const [isOpen, setIsOpen] = useState(false);
    const [autofocusSubmenu, setAutofocusSubmenu] = useState(false);
    const intl = useIntl();
    const tooltipText = intl.formatMessage({ id: "controlButtons.options.tooltip" });
    const backLabel = intl.formatMessage({ id: "controlButtons.options.back" });
    const closeLabel = intl.formatMessage({ id: "controlButtons.options.close" });
    const menuWrapperRef = useRef<HTMLDivElement>(null!);
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
    const idPrefix = useId();
    const buttonId = `${idPrefix}-menu-button`;
    const menuId = `${idPrefix}-menu`;
    const dropdownAnchorClassName = useMemo(
        () => `dash-header-options-anchor-${idPrefix.slice(1)}`,
        [idPrefix],
    );

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

    const menuKeyboardNavigationHandler = makeMenuKeyboardNavigation<KeyboardEvent>({
        onFocusFirst: () => {
            const { firstElement } = getFocusableElements(menuWrapperRef.current ?? undefined);
            firstElement?.focus();
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
            if (selectedMenuItem && event.key === "Tab") {
                const { focusableElements } = getFocusableElements(menuWrapperRef.current ?? undefined);
                let currentIndex = Array.from(focusableElements).indexOf(
                    document.activeElement as HTMLElement,
                );
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
            }
            event.preventDefault();
            event.stopPropagation();
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
                <UiFocusTrap
                    autofocusOnOpen={true}
                    customKeyboardNavigationHandler={menuKeyboardNavigationHandler}
                >
                    <ItemsWrapper
                        wrapperRef={menuWrapperRef}
                        smallItemsSpacing
                        className="gd-menu"
                        accessibilityConfig={{
                            role: "menu",
                            ariaLabelledBy: buttonId,
                            id: menuId,
                        }}
                    >
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
                        {visibleMenuItems.map((menuItem) => {
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
                                return renderWithOptionalTooltip(menuItem, ({ selectorClassName }) => (
                                    <SingleSelectListItem
                                        ref={setMenuItemRef(menuItem.itemId)}
                                        className={cx(
                                            "gd-menu-item",
                                            menuItem.className,
                                            `s-${menuItem.itemId}`,
                                            {
                                                [selectorClassName]: menuItem.tooltip,
                                                "is-disabled": menuItem.disabled,
                                            },
                                        )}
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
                                            ariaHaspopup: "menu",
                                            ariaExpanded:
                                                selectedMenuItem?.itemId === menuItem.itemId
                                                    ? "true"
                                                    : "false",
                                            ariaDisabled: menuItem.disabled ? "true" : undefined,
                                        }}
                                    />
                                ));
                            }

                            return renderWithOptionalTooltip(menuItem, ({ selectorClassName }) => (
                                <SingleSelectListItem
                                    ref={setMenuItemRef(menuItem.itemId)}
                                    className={cx(
                                        "gd-menu-item",
                                        menuItem.className,
                                        `s-${menuItem.itemId}`,
                                        {
                                            [selectorClassName]: menuItem.tooltip,
                                            "is-disabled": menuItem.disabled,
                                        },
                                    )}
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
                                        ariaDisabled: menuItem.disabled ? "true" : undefined,
                                    }}
                                />
                            ));
                        })}
                    </ItemsWrapper>
                </UiFocusTrap>
            </Overlay>
        );
    };

    const renderWithOptionalTooltip = (
        menuItem: IMenuButtonItemButton | IMenuButtonItemMenu,
        children: (data: { selectorClassName: string }) => ReactElement,
    ) => {
        const selectorClassName = `gd-menu-item-${menuItem.itemId}`;

        if (!menuItem.tooltip) {
            return children({ selectorClassName });
        }

        return (
            <BubbleHoverTrigger key={menuItem.itemId} eventsOnBubble={true}>
                {children({
                    selectorClassName,
                })}
                <Bubble alignTo={`.${selectorClassName}`} alignPoints={bubbleAlignPoints}>
                    <span>{menuItem.tooltip}</span>
                </Bubble>
            </BubbleHoverTrigger>
        );
    };

    return (
        <>
            <BubbleHoverTrigger className="dash-header-options-wrapper" showDelay={100}>
                <Button
                    onClick={onMenuButtonClick}
                    value="&#8943;"
                    id={buttonId}
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
                {!isOpen ? (
                    <Bubble
                        alignTo="gd-button-primary dash-header-options-button"
                        alignPoints={ALIGN_POINTS_TOOLTIP}
                    >
                        {tooltipText}
                    </Bubble>
                ) : null}
            </BubbleHoverTrigger>
            {isOpen ? renderMenuItems() : null}
        </>
    );
};
