// (C) 2025 GoodData Corporation

import { MouseEventHandler, useCallback, useEffect, useMemo, useRef } from "react";

import { useIntl } from "react-intl";

import { Dropdown, IUiMenuItem, UiIcon, UiMenu, useOverlayZIndexWithRegister } from "@gooddata/sdk-ui-kit";

import { AggregationsMenuItemData, HeaderInteractiveItem, buildUiMenuItems } from "./HeaderMenuComponents.js";
import { messages } from "../../../../locales.js";
import { useHeaderMenuContext } from "../../../context/HeaderMenuContext.js";
import { e } from "../../../features/styling/bem.js";
import { getPivotHeaderMenuButtonTestIdProps } from "../../../testing/dataTestIdGenerators.js";
import {
    IAggregationsMenuItem,
    IAggregationsSubMenuItem,
    ISortingMenuItem,
    ITextWrappingMenuItem,
} from "../../../types/menu.js";

export interface IHeaderMenuProps {
    aggregationsItems: IAggregationsMenuItem[];
    textWrappingItems: ITextWrappingMenuItem[];
    sortingItems: ISortingMenuItem[];
    onAggregationsItemClick: (item: IAggregationsSubMenuItem) => void;
    onTextWrappingItemClick: (item: ITextWrappingMenuItem) => void;
    onSortingItemClick: (item: ISortingMenuItem) => void;
    isMenuOpened: boolean;
    onMenuOpenedChange: (opened: boolean) => void;
    /**
     * Whether the menu was opened via keyboard (Alt + Down Arrow).
     * When true, the menu will autofocus on open.
     */
    isKeyboardTriggered?: boolean;
}

function MenuToggler({ onClick }: { onClick: MouseEventHandler<HTMLButtonElement> }) {
    const intl = useIntl();

    return (
        <button
            type="button"
            className={e("header-cell-menu-button")}
            onClick={onClick}
            aria-label={intl.formatMessage(messages["openHeaderMenuAria"])}
            {...getPivotHeaderMenuButtonTestIdProps()}
        >
            <UiIcon type="ellipsisVertical" ariaHidden />
            <span className={e("header-cell-menu-clickable-area")}></span>
        </button>
    );
}

export function HeaderMenu({
    aggregationsItems,
    textWrappingItems,
    sortingItems,
    onAggregationsItemClick,
    onTextWrappingItemClick,
    onSortingItemClick,
    isMenuOpened,
    onMenuOpenedChange,
    isKeyboardTriggered = false,
}: IHeaderMenuProps) {
    const intl = useIntl();
    const toggleDropdownRef = useRef<((desired?: boolean) => void) | null>(null);
    const prevIsMenuOpenedRef = useRef(isMenuOpened);
    const { activeMenuCloseRef, closeActiveMenu } = useHeaderMenuContext();

    // Register close function when menu is open
    if (isMenuOpened) {
        activeMenuCloseRef.current = () => onMenuOpenedChange(false);
    }

    const uiMenuItems = useMemo(
        () => buildUiMenuItems(aggregationsItems, textWrappingItems, sortingItems, intl),
        [aggregationsItems, textWrappingItems, sortingItems, intl],
    );

    // When isMenuOpened changes from parent and we have the toggle function,
    // use it instead of relying on prop changes alone
    useEffect(() => {
        if (isMenuOpened !== prevIsMenuOpenedRef.current && toggleDropdownRef.current) {
            toggleDropdownRef.current(isMenuOpened);
        }
        prevIsMenuOpenedRef.current = isMenuOpened;
    }, [isMenuOpened]);

    const handleSelect = useCallback(
        (item: IUiMenuItem<AggregationsMenuItemData>) => {
            if (item.type !== "interactive" || item.isDisabled) {
                return;
            }

            if (item.data && item.data.type === "aggregation") {
                onAggregationsItemClick(item.data);
            } else if (item.data && item.data.type === "textWrapping") {
                onTextWrappingItemClick(item.data);
            } else if (item.data && item.data.type === "sorting") {
                onSortingItemClick(item.data);
            }

            onMenuOpenedChange(false);
        },
        [onAggregationsItemClick, onTextWrappingItemClick, onSortingItemClick, onMenuOpenedChange],
    );

    const handleToggle = useCallback(
        (desired?: boolean) => {
            const opened = typeof desired === "boolean" ? desired : !isMenuOpened;
            onMenuOpenedChange(opened);
        },
        [isMenuOpened, onMenuOpenedChange],
    );

    // Handle menu button click - close other menus, then toggle this one
    const handleButtonClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        (e) => {
            e.stopPropagation();
            closeActiveMenu();
            onMenuOpenedChange(!isMenuOpened);
        },
        [isMenuOpened, closeActiveMenu, onMenuOpenedChange],
    );

    const overlayZIndex = useOverlayZIndexWithRegister();

    return (
        <div className={e("header-cell-menu-button-wrapper")}>
            <Dropdown
                isOpen={isMenuOpened}
                onToggle={handleToggle}
                closeOnEscape
                closeOnOutsideClick
                closeOnParentScroll
                overlayPositionType="sameAsTarget"
                alignPoints={[
                    { align: "bl tl", offset: { x: -10, y: 16 } },
                    { align: "br tr", offset: { x: -10, y: 16 } },
                ]}
                accessibilityConfig={{ triggerRole: "button", popupRole: "dialog" }}
                overlayZIndex={overlayZIndex}
                autofocusOnOpen={isKeyboardTriggered}
                renderButton={({ toggleDropdown }) => {
                    toggleDropdownRef.current = toggleDropdown;
                    return <MenuToggler onClick={handleButtonClick} />;
                }}
                renderBody={({ closeDropdown, ariaAttributes }) => (
                    <UiMenu<AggregationsMenuItemData>
                        items={uiMenuItems}
                        onSelect={handleSelect}
                        onClose={closeDropdown}
                        shouldCloseOnSelect={false}
                        containerBottomPadding="small"
                        ariaAttributes={{
                            id: ariaAttributes.id,
                            "aria-labelledby": ariaAttributes["aria-labelledby"],
                        }}
                        InteractiveItem={HeaderInteractiveItem}
                        size={"small"}
                    />
                )}
            />
        </div>
    );
}
