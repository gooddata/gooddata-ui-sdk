// (C) 2021-2022 GoodData Corporation

import React from "react";

/**
 * @internal
 */
export interface IEditableLabelProps {
    children?: React.ReactNode;
    className?: string;
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
}

/**
 * @internal
 */
export interface IEditableLabelState {
    value: string;
    isEditing: boolean;
    textareaWidth: number;
    textareaFontSize?: number;
}
