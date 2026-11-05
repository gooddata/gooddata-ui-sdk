// (C) 2007-2026 GoodData Corporation

import { useCallback, useState } from "react";

import { Button } from "@gooddata/sdk-ui-kit";

import { type IAnalyticalDesignerOptionsProps } from "../../../embedding/editorHeaderSlotTypes.js";

import { OptionsMenu } from "./OptionsMenu.js";

/**
 * Default of the Options slot: a button that opens the menu of the given items.
 */
export function DefaultOptions({
    label,
    accessibleName,
    isDisabled,
    items,
}: IAnalyticalDesignerOptionsProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = useCallback(() => {
        setIsMenuOpen((open) => !open);
    }, []);

    const closeMenu = useCallback(() => {
        setIsMenuOpen(false);
    }, []);

    return (
        <>
            <Button
                className="gd-button-secondary s-options-button editor-header-item"
                value={label}
                disabled={isDisabled}
                onClick={toggleMenu}
                accessibilityConfig={{
                    ariaLabel: accessibleName,
                    ariaHaspopup: "menu",
                    ariaExpanded: isMenuOpen,
                }}
            />
            {isMenuOpen ? <OptionsMenu items={items} onClose={closeMenu} /> : null}
        </>
    );
}
