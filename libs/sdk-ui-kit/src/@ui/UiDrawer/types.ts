// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, type ReactNode, type RefObject } from "react";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { type IUiAutofocusOptions } from "../UiFocusManager/UiAutofocus.js";

/**
 * @internal
 */
export type UiDrawerTransitionProps = {
    duration?: number;
    easing?: "ease-in" | "ease-out" | "ease-in-out";
    delay?: number;
};

/**
 * @internal
 */
export interface UiDrawerProps extends IUiAutofocusOptions {
    open?: boolean;
    mode?: "absolute" | "fixed";
    node?: HTMLElement;
    dataTestId?: string;
    zIndex?: number;
    children?: ReactNode;
    anchor?: "left" | "right";
    transition?: UiDrawerTransitionProps;
    onEscapeKey?: (e: KeyboardEvent) => void;
    onClickOutside?: (e: MouseEvent) => void;
    closeLabel?: string;
    showCloseButton?: boolean;
    onClickClose?: () => void;
    returnFocusTo?: string | RefObject<HTMLElement | null> | (() => HTMLElement | null);
    accessibilityConfig?: IAccessibilityConfigBase;
}
