// (C) 2025-2026 GoodData Corporation

import {
    type CSSProperties,
    type KeyboardEventHandler,
    type MutableRefObject,
    type ReactNode,
    type RefObject,
} from "react";

import { type IDropdownButtonAccessibilityConfig } from "../../Button/typings.js";
import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { type IconType } from "../@types/icon.js";
import { type ThemeColor } from "../@types/themeColors.js";

/**
 * @internal
 */
export interface IUiChipAccessibilityConfig
    extends IAccessibilityConfigBase, IDropdownButtonAccessibilityConfig {
    deleteAriaLabel?: string;
    deleteAriaDescribedBy?: string;
    iconBeforeAriaLabel?: string;
    iconAfterAriaLabel?: string;
    actionAriaLabel?: string;
    actionAriaDescribedBy?: string;
}

/**
 * @internal
 */
export interface IUiChipProps {
    label: string;
    tag?: string;
    isDeletable?: boolean;
    isActionable?: boolean;
    isActive?: boolean;
    isLocked?: boolean;
    isExpandable?: boolean;
    isDisabled?: boolean;
    maxWidth?: number;
    iconAction?: IconType;
    iconBefore?: IconType;
    iconAfter?: IconType;
    iconColor?: ThemeColor | "currentColor";
    variant?: "normal" | "inactive";
    onClick?: () => void;
    onDelete?: () => void;
    onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
    onDeleteKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
    onAction?: () => void;
    onActionKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
    accessibilityConfig?: IUiChipAccessibilityConfig;
    dataTestId?: string;
    buttonRef?: MutableRefObject<HTMLButtonElement>;
    renderChipContent?: (content: ReactNode) => ReactNode;
    renderActionButton?: (button: ReactNode) => ReactNode;
}

export interface IChipContentProps {
    label: string;
    tag?: string;
    iconBefore?: IconType;
    iconAfter?: IconType;
    iconColor?: ThemeColor | "currentColor";
    onClick?: () => void;
    onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
    isActive: boolean;
    isLocked: boolean;
    isExpandable: boolean;
    isDisabled: boolean;
    maxWidth?: number;
    isDeletable: boolean;
    isActionable: boolean;
    variant?: "normal" | "inactive";
    accessibilityConfig?: IUiChipAccessibilityConfig;
    dataTestId?: string;
    buttonRef: MutableRefObject<HTMLButtonElement> | RefObject<HTMLButtonElement | null>;
    styleObj?: CSSProperties;
}

export interface IChipDeleteButtonProps {
    onDelete?: () => void;
    onDeleteKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
    deleteAriaLabel?: string;
    deleteAriaDescribedBy?: string;
    dataTestId?: string;
}

export interface IChipActionButtonProps {
    onAction?: () => void;
    onActionKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
    actionAriaLabel?: string;
    actionAriaDescribedBy?: string;
    actionIcon?: IconType;
    dataTestId?: string;
}
