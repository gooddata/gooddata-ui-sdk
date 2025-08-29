// (C) 2025 GoodData Corporation

import { ReactNode } from "react";

import { IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { IUiAutofocusOptions } from "../UiFocusManager/UiAutofocus.js";

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
    onEscapeKey?: (e: React.KeyboardEvent) => void;
    onClickOutside?: (e: React.MouseEvent) => void;
    closeLabel?: string;
    showCloseButton?: boolean;
    onClickClose?: () => void;
    accessibilityConfig?: IAccessibilityConfigBase;
}
