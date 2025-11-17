// (C) 2020-2025 GoodData Corporation

import { AriaAttributes, HTMLAttributes } from "react";

/**
 * @internal
 */
export interface IAccessibilityConfigBase {
    ariaLabel?: AriaAttributes["aria-label"];
    ariaLabelledBy?: AriaAttributes["aria-labelledby"];
    ariaDescribedBy?: AriaAttributes["aria-describedby"];
    ariaDescription?: AriaAttributes["aria-description"];
    role?: HTMLAttributes<HTMLElement>["role"];
    ariaExpanded?: AriaAttributes["aria-expanded"];
    ariaControls?: AriaAttributes["aria-controls"];
    ariaActiveDescendant?: AriaAttributes["aria-activedescendant"];
    ariaCurrent?: AriaAttributes["aria-current"];
    ariaHaspopup?: AriaAttributes["aria-haspopup"];
    ariaAutocomplete?: AriaAttributes["aria-autocomplete"];
    ariaPressed?: AriaAttributes["aria-pressed"];
}

/**
 * @internal
 */
export interface IMenuAccessibilityConfig extends IAccessibilityConfigBase {
    id?: string;
    role?: "menu" | "menuitem" | "separator" | "presentation";
    ariaDisabled?: AriaAttributes["aria-disabled"];
    // to support submenu
    ariaHasPopup?: "true" | "false" | "menu" | "listbox" | "tree" | "grid" | "dialog";
}

/**
 * @internal
 */
export interface IMenuContainerAccessibilityConfig extends IMenuAccessibilityConfig {
    role?: "menu";
}
