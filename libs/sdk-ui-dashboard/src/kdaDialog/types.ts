// (C) 2025 GoodData Corporation

/**
 * @internal
 */
export interface IKdaDialogProps {
    /**
     * Locale for the dialog
     */
    locale?: string;
    /**
     * CSS class name for the dialog
     */
    className?: string;

    /**
     * Whether to show the close button
     */
    showCloseButton?: boolean;

    /**
     * Custom close button handler
     */
    onClose?: () => void;
}
