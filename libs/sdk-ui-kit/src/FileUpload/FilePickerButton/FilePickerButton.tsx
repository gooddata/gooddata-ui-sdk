// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import { type IUiButtonProps, UiButton } from "../../@ui/UiButton/UiButton.js";
import { useFileInput } from "../hooks/useFileInput.js";

/**
 * @internal
 */
export interface IFilePickerButtonProps {
    buttonLabel: string;
    acceptedFileTypes?: string;
    multiple?: boolean;
    disabled?: boolean;
    ariaLabel?: string;
    buttonProps?: Omit<IUiButtonProps, "label">;
    onFilesSelected: (files: File[]) => void;
}

/**
 * @internal
 */
export function FilePickerButton({
    buttonLabel,
    acceptedFileTypes,
    multiple = false,
    disabled = false,
    ariaLabel,
    onFilesSelected,
    buttonProps,
}: IFilePickerButtonProps) {
    const { inputRef, handleInputChange } = useFileInput(onFilesSelected);

    const onButtonClick = useCallback(() => {
        if (disabled) {
            return;
        }

        inputRef.current?.click();
    }, [disabled, inputRef]);

    return (
        <>
            <UiButton
                isDisabled={disabled}
                label={buttonLabel}
                onClick={onButtonClick}
                accessibilityConfig={{ ariaLabel }}
                {...buttonProps}
            />
            <input
                ref={inputRef}
                hidden
                type="file"
                disabled={disabled}
                accept={acceptedFileTypes}
                multiple={multiple}
                onChange={handleInputChange}
            />
        </>
    );
}
