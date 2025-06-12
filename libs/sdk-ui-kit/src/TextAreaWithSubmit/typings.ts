// (C) 2021-2022 GoodData Corporation

/**
 * @internal
 */
export interface ITextAreaWithSubmitProps {
    className?: string;
    maxLength?: number;
    rows?: number;
    onCancel?: (value: string) => void;
    onEditingStart?: () => void;
    onChange?: (value: string) => void;
    onSubmit: (value: string) => void;
    placeholder?: string;
    scrollToEndOnEditingStart?: boolean;
    defaultValue: string;
    autofocus?: boolean;
    disabled?: boolean;
}

/**
 * @internal
 */
export interface ITextAreaWithSubmitState {
    value: string;
    isEditing: boolean;
}
