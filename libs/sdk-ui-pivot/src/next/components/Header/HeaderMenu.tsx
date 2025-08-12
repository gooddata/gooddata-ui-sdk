// (C) 2025 GoodData Corporation

import React from "react";
import { UiIcon, UiMenu, IUiMenuItem, Dropdown } from "@gooddata/sdk-ui-kit";
import { IAggregationsMenuTotalItem, IAggregationsMenuItem } from "../../types/menu.js";
import { e } from "../../features/styling/bem.js";
import { AggregationsMenuItemData, buildUiMenuItems, SmallInteractiveItem } from "./HeaderMenuComponents.js";

export interface IHeaderMenuProps {
    items: IAggregationsMenuItem[];
    onItemClick: (item: IAggregationsMenuTotalItem) => void;
    isMenuOpened: boolean;
    onMenuOpenedChange: (opened: boolean) => void;
}

function MenuToggler({ onClick }: { onClick: () => void }) {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onClick();
    };

    return (
        <button
            type="button"
            className={e("header-cell-menu-button")}
            onClick={handleClick}
            aria-label="Open header menu"
        >
            <UiIcon type="ellipsisVertical" ariaHidden />
        </button>
    );
}

export function HeaderMenu(props: IHeaderMenuProps) {
    const { items, onItemClick, isMenuOpened, onMenuOpenedChange } = props;

    const uiMenuItems = React.useMemo(() => buildUiMenuItems(items), [items]);

    const handleSelect = React.useCallback(
        (item: IUiMenuItem<AggregationsMenuItemData>) => {
            if (item.type === "interactive" && item.data) {
                onItemClick(item.data);
                onMenuOpenedChange(false);
            }
        },
        [onItemClick, onMenuOpenedChange],
    );

    const handleToggle = React.useCallback(
        (desired?: boolean) => {
            const opened = typeof desired === "boolean" ? desired : !isMenuOpened;
            onMenuOpenedChange(opened);
        },
        [isMenuOpened, onMenuOpenedChange],
    );

    return (
        <Dropdown
            isOpen={isMenuOpened}
            onToggle={handleToggle}
            closeOnEscape={true}
            closeOnOutsideClick={true}
            accessibilityConfig={{ triggerRole: "button", popupRole: "dialog" }}
            renderButton={({ toggleDropdown }) => <MenuToggler onClick={() => toggleDropdown()} />}
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
                    maxHeight={260}
                    InteractiveItem={SmallInteractiveItem}
                />
            )}
        />
    );
}
