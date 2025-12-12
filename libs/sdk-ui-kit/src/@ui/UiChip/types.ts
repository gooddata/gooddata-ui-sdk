// (C) 2025 GoodData Corporation

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

/**
 * @internal
 */
export interface IUiChipAccessibilityConfig
    extends IAccessibilityConfigBase,
        IDropdownButtonAccessibilityConfig {
    deleteAriaLabel?: string;
    deleteAriaDescribedBy?: string;
}

/**
 * @internal
 */
export interface UiChipProps {
    label: string;
    tag?: string;
    isDeletable?: boolean;
    isActive?: boolean;
    isLocked?: boolean;
    isExpandable?: boolean;
    isDisabled?: boolean;
    maxWidth?: number;
    iconBefore?: IconType;
    onClick?: () => void;
    onDelete?: () => void;
    onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
    onDeleteKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
    accessibilityConfig?: IUiChipAccessibilityConfig;
    dataTestId?: string;
    buttonRef?: MutableRefObject<HTMLButtonElement>;
    renderChipContent?: (content: ReactNode) => ReactNode;
    renderDeleteButton?: (button: ReactNode) => ReactNode;
}

export interface ChipContentProps {
    label: string;
    tag?: string;
    iconBefore?: IconType;
    onClick?: () => void;
    onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
    isActive: boolean;
    isLocked: boolean;
    isExpandable: boolean;
    isDisabled: boolean;
    maxWidth?: number;
    isDeletable: boolean;
    accessibilityConfig?: IUiChipAccessibilityConfig;
    dataTestId?: string;
    buttonRef: MutableRefObject<HTMLButtonElement> | RefObject<HTMLButtonElement | null>;
    styleObj?: CSSProperties;
}

export interface ChipDeleteButtonProps {
    onDelete?: () => void;
    onDeleteKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
    deleteAriaLabel?: string;
    deleteAriaDescribedBy?: string;
    dataTestId?: string;
}
