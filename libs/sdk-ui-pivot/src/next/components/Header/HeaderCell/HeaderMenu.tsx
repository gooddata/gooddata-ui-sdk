// (C) 2025 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import { Dropdown, IUiMenuItem, UiIcon, UiMenu, useOverlayZIndexWithRegister } from "@gooddata/sdk-ui-kit";

import { AggregationsMenuItemData, SmallInteractiveItem, buildUiMenuItems } from "./HeaderMenuComponents.js";
import { messages } from "../../../../locales.js";
import { e } from "../../../features/styling/bem.js";
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
}

function MenuToggler({ onClick }: { onClick: () => void }) {
    const intl = useIntl();

    return (
        <button
            type="button"
            className={e("header-cell-menu-button")}
            onClick={onClick}
            aria-label={intl.formatMessage(messages["openHeaderMenuAria"])}
        >
            <UiIcon type="ellipsisVertical" ariaHidden />
            <span className={e("header-cell-menu-clickable-area")}></span>
        </button>
    );
}

export function HeaderMenu(props: IHeaderMenuProps) {
    const intl = useIntl();
    const {
        aggregationsItems,
        textWrappingItems,
        sortingItems,
        onAggregationsItemClick,
        onTextWrappingItemClick,
        onSortingItemClick,
        isMenuOpened,
        onMenuOpenedChange,
    } = props;

    const uiMenuItems = useMemo(
        () => buildUiMenuItems(aggregationsItems, textWrappingItems, sortingItems, intl),
        [aggregationsItems, textWrappingItems, sortingItems, intl],
    );

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
                renderButton={({ toggleDropdown }) => <MenuToggler onClick={toggleDropdown} />}
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
                        InteractiveItem={SmallInteractiveItem}
                    />
                )}
            />
        </div>
    );
}
