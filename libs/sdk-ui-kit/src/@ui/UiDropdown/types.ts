// (C) 2025 GoodData Corporation

import { type ReactNode, type RefObject } from "react";

import { type OffsetOptions, type Placement } from "@floating-ui/react";

import { type ILegacyAlignPoint } from "../UiFloatingElement/types.js";

/**
 * Props for the UiDropdown component.
 *
 * @internal
 */
export interface IUiDropdownProps {
    /**
     * Render function for the dropdown button/trigger.
     */
    renderButton: (props: IUiDropdownButtonRenderProps) => ReactNode;

    /**
     * Render function for the dropdown body/content.
     */
    renderBody: (props: IUiDropdownBodyRenderProps) => ReactNode;

    /**
     * Controlled open state.
     */
    isOpen?: boolean;

    /**
     * Callback when open state changes.
     */
    onOpenChange?: (isOpen: boolean) => void;

    /**
     * Callback when dropdown opens.
     */
    onOpen?: () => void;

    /**
     * Callback when dropdown closes.
     */
    onClose?: () => void;

    /**
     * Whether the dropdown starts open.
     * @defaultValue false
     */
    openOnInit?: boolean;

    /**
     * Placement of the dropdown relative to the button.
     * @defaultValue "bottom-start"
     */
    placement?: Placement;

    /**
     * Offset of the dropdown from the button.
     */
    offset?: OffsetOptions;

    /**
     * Legacy align points for backwards compatibility.
     */
    alignPoints?: ILegacyAlignPoint[];

    /**
     * Whether to close when clicking outside.
     * @defaultValue true
     */
    closeOnOutsideClick?: boolean;

    /**
     * Whether to close when pressing Escape.
     * @defaultValue false
     */
    closeOnEscape?: boolean;

    /**
     * Whether to close when parent scrolls.
     * @defaultValue false
     */
    closeOnParentScroll?: boolean;

    /**
     * Whether to close on mouse drag.
     * @defaultValue false
     */
    closeOnMouseDrag?: boolean;

    /**
     * CSS selectors to ignore for outside click detection.
     */
    ignoreClicksOnByClass?: string[];

    /**
     * Custom z-index.
     */
    zIndex?: number;

    /**
     * Width of the dropdown body.
     */
    width?: number | "same-as-anchor" | "auto";

    /**
     * Whether to enable focus trap.
     * @defaultValue true
     */
    enableFocusTrap?: boolean;

    /**
     * Whether to autofocus when opened.
     * @defaultValue false
     */
    autofocusOnOpen?: boolean;

    /**
     * Element to focus initially when opened.
     */
    initialFocus?: RefObject<HTMLElement> | string;

    /**
     * Element to return focus to when closed.
     */
    returnFocusTo?: RefObject<HTMLElement> | string;

    /**
     * Accessibility configuration for trigger and body roles.
     */
    accessibilityConfig?: {
        triggerRole?: "button" | "combobox";
        popupRole?: "listbox" | "tree" | "grid" | "dialog" | "menu";
    };
}

/**
 * Props passed to the button render function.
 *
 * @internal
 */
export interface IUiDropdownButtonRenderProps {
    /**
     * Ref to attach to the button element.
     */
    ref: RefObject<HTMLElement>;

    /**
     * Whether the dropdown is currently open.
     */
    isOpen: boolean;

    /**
     * ID of the dropdown content (for aria-controls).
     */
    dropdownId: string;

    /**
     * Open the dropdown.
     */
    openDropdown: () => void;

    /**
     * Close the dropdown.
     */
    closeDropdown: () => void;

    /**
     * Toggle the dropdown state.
     */
    toggleDropdown: () => void;

    /**
     * ARIA attributes to spread on the button element.
     */
    ariaAttributes: {
        role: "button" | "combobox";
        "aria-haspopup": "listbox" | "tree" | "grid" | "dialog" | "menu" | true;
        "aria-expanded": boolean;
        "aria-controls"?: string;
    };
}

/**
 * Props passed to the body render function.
 *
 * @internal
 */
export interface IUiDropdownBodyRenderProps {
    /**
     * Close the dropdown.
     */
    closeDropdown: () => void;

    /**
     * ARIA attributes to spread on the body element.
     */
    ariaAttributes: {
        id: string;
    };
}
