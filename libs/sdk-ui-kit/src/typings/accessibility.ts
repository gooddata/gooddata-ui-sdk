// (C) 2020-2025 GoodData Corporation

/**
 * @internal
 */
export interface IAccessibilityConfigBase {
    ariaLabel?: React.AriaAttributes["aria-label"];
    ariaLabelledBy?: React.AriaAttributes["aria-labelledby"];
    ariaDescribedBy?: React.AriaAttributes["aria-describedby"];
    role?: React.HTMLAttributes<HTMLElement>["role"];
    ariaExpanded?: React.AriaAttributes["aria-expanded"];
    ariaControls?: string;
}

/**
 * @internal
 */
export interface IMenuAccessibilityConfig extends IAccessibilityConfigBase {
    id?: string;
    role?: "menu" | "menuitem" | "separator" | "presentation";
    ariaDisabled?: React.AriaAttributes["aria-disabled"];
    // to support submenu
    ariaHasPopup?: "true" | "false" | "menu" | "listbox" | "tree" | "grid" | "dialog";
    ariaControls?: string;
}

/**
 * @internal
 */
export interface IMenuContainerAccessibilityConfig extends IMenuAccessibilityConfig {
    role?: "menu";
}
