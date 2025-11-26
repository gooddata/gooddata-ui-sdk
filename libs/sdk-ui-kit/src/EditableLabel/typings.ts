// (C) 2021-2025 GoodData Corporation

import { ReactNode } from "react";

/**
 * @internal
 */
export interface IEditableLabelProps {
    children?: ReactNode;
    className?: string;
    id?: string;
    maxLength?: number;
    maxRows?: number;
    onCancel?: (value: string) => void;
    onEditingStart?: () => void;
    onChange?: (value: string) => void;
    onSubmit: (value: string) => void;
    placeholder?: string;
    scrollToEndOnEditingStart?: boolean;
    textareaInOverlay?: boolean;
    value: string;
    autofocus?: boolean;
    isEditableLabelWidthBasedOnText?: boolean;
    ariaLabel?: string;
    autocomplete?: string;
}

/**
 * @internal
 */
export interface IEditableLabelState {
    value: string;
    isEditing: boolean;
    rootWidth: number;
    textareaWidth: number;
    textareaFontSize?: number;
}
