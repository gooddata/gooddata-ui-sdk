// (C) 2025 GoodData Corporation

import React, { useState } from "react";
import { HeaderMenu } from "./HeaderMenu.js";
import { e } from "../../features/styling/bem.js";
import { IAggregationsMenuTotalItem, IAggregationsMenuItem } from "../../types/menu.js";

interface IHeaderCellWithMenuProps {
    displayName: React.ReactNode;
    items: IAggregationsMenuItem[];
    onItemClick: (item: IAggregationsMenuTotalItem) => void;
}

/**
 * Reusable wrapper component for header cells with menu.
 */
export function HeaderCellWithMenu({ displayName, items, onItemClick }: IHeaderCellWithMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={e("header-cell-with-menu", { "is-open": isOpen })}>
            <HeaderMenu
                items={items}
                onItemClick={onItemClick}
                isMenuOpened={isOpen}
                onMenuOpenedChange={(opened) => setIsOpen(opened)}
            />
            <span>{displayName}</span>
        </div>
    );
}
