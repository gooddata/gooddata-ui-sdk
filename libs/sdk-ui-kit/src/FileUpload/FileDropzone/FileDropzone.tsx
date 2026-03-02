// (C) 2026 GoodData Corporation

import {
    type DragEvent,
    type KeyboardEvent,
    type ReactNode,
    forwardRef,
    useCallback,
    useImperativeHandle,
    useState,
} from "react";

import { useFileInput } from "../hooks/useFileInput.js";
import { parseAcceptedTypes } from "../parseAcceptedTypes.js";
import { FileValidationErrorCode, type IFileValidationResult } from "../types.js";
import { b } from "./fileDropzoneBem.js";

type DragState = "idle" | "valid" | "invalid";

/**
 * @internal
 */
export interface IFileDropzoneProps {
    /**
     * Specifies the types of files that are accepted.
     * This should be a string containing a comma-separated list of file types or MIME types.
     * MIME types are strongly encouraged since they can be validated on dragover.
     *
     * If undefined, all file types are accepted.
     */
    acceptedFileTypes?: string;
    multiple?: boolean;
    disabled?: boolean;
    ariaLabel?: string;
    idleLabel: ReactNode;
    activeLabel?: ReactNode;
    /**
     * Content shown when the user drags an invalid file over the dropzone.
     * Pass a function to customize the message based on the specific error.
     */
    invalidLabel?: ReactNode | ((errorCode: FileValidationErrorCode | undefined) => ReactNode);
    /**
     * Extra props forwarded to the hidden `<input type="file">` element.
     * Use for E2E test selectors (e.g. `className`, `data-testid`).
     */
    inputProps?: { className?: string; testId?: string };
    onFilesSelected: (files: File[]) => void;
}

/**
 * @internal
 */
export interface IFileDropzoneHandle {
    open: () => void;
}

/**
 * @internal
 */
export const FileDropzone = forwardRef<IFileDropzoneHandle, IFileDropzoneProps>(function FileDropzone(
    {
        acceptedFileTypes,
        multiple = false,
        disabled = false,
        ariaLabel,
        idleLabel,
        activeLabel,
        invalidLabel,
        inputProps,
        onFilesSelected,
    }: IFileDropzoneProps,
    ref,
) {
    const { inputRef, handleInputChange } = useFileInput(onFilesSelected);

    useImperativeHandle(ref, () => ({
        open: () => inputRef.current?.click(),
    }));
    const [dragState, setDragState] = useState<DragState>("idle");
    const [dragErrorCode, setDragErrorCode] = useState<FileValidationErrorCode | undefined>(undefined);

    const resetDragState = useCallback(() => {
        setDragState("idle");
        setDragErrorCode(undefined);
    }, []);

    const handleDrop = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            if (disabled) {
                return;
            }

            resetDragState();
            const files = event.dataTransfer.files ? Array.from(event.dataTransfer.files) : [];
            if (!multiple && files.length > 1) {
                return;
            }
            const result = isValidDroppedFiles(files, acceptedFileTypes);
            if (!result.isValid) {
                return;
            }
            if (files.length) {
                onFilesSelected(files);
            }
        },
        [acceptedFileTypes, disabled, multiple, onFilesSelected, resetDragState],
    );

    const handleDragOver = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            if (disabled) {
                event.dataTransfer.dropEffect = "none";
                return;
            }

            const result = isValidDragData(event.dataTransfer.items, acceptedFileTypes, multiple);
            event.dataTransfer.dropEffect = result.isValid ? "copy" : "none";
            setDragState(result.isValid ? "valid" : "invalid");
            setDragErrorCode(result.errorCode);
        },
        [disabled, acceptedFileTypes, multiple],
    );

    const handleOpenFilePicker = useCallback(() => {
        if (!disabled) {
            inputRef.current?.click();
        }
    }, [disabled, inputRef]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleOpenFilePicker();
            }
        },
        [handleOpenFilePicker],
    );

    const resolvedInvalidLabel =
        typeof invalidLabel === "function" ? invalidLabel(dragErrorCode) : invalidLabel;

    const label = (() => {
        if (dragState === "invalid") {
            return resolvedInvalidLabel ?? idleLabel;
        }

        if (dragState === "valid") {
            return activeLabel ?? idleLabel;
        }

        return idleLabel;
    })();

    return (
        <>
            <div
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-disabled={disabled}
                aria-label={ariaLabel}
                className={b({
                    active: dragState === "valid",
                    invalid: dragState === "invalid",
                    disabled,
                })}
                onClick={handleOpenFilePicker}
                onDragOver={handleDragOver}
                onDragLeave={resetDragState}
                onDrop={handleDrop}
                onKeyDown={handleKeyDown}
            >
                {label}
            </div>
            <input
                className={inputProps?.className}
                data-testid={inputProps?.testId}
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
});

function isValidDragData(
    items: DataTransferItemList,
    acceptedFileTypes?: string,
    multiple?: boolean,
): IFileValidationResult {
    const fileItems = Array.from(items).filter((item) => item.kind === "file");

    if (fileItems.length === 0) {
        return { isValid: false };
    }

    if (!multiple && fileItems.length > 1) {
        return { isValid: false, errorCode: FileValidationErrorCode.TooManyFiles };
    }

    if (!acceptedFileTypes) {
        return { isValid: true };
    }

    const { extensions, exactMimeTypes, wildcardMimePrefixes } = parseAcceptedTypes(acceptedFileTypes);

    const allValid = fileItems.every((item) => {
        const mimeType = item.type.toLowerCase();

        if (!mimeType) {
            // MIME type unavailable — cannot validate, allow through
            return true;
        }

        if (exactMimeTypes.includes(mimeType)) {
            return true;
        }

        if (wildcardMimePrefixes.some((prefix) => mimeType.startsWith(prefix))) {
            return true;
        }

        // Extension patterns can't be checked during drag — if any are present,
        // the file might still be valid, so defer to drop-time validation
        return extensions.length > 0;
    });

    if (!allValid) {
        return { isValid: false, errorCode: FileValidationErrorCode.InvalidFileType };
    }

    return { isValid: true };
}

function isValidDroppedFiles(files: File[], acceptedFileTypes?: string): IFileValidationResult {
    if (files.length === 0 || !acceptedFileTypes) {
        return { isValid: true };
    }

    const { extensions, exactMimeTypes, wildcardMimePrefixes } = parseAcceptedTypes(acceptedFileTypes);

    const allValid = files.every((file) => {
        const mimeType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();
        const hasMimeRestrictions = exactMimeTypes.length > 0 || wildcardMimePrefixes.length > 0;

        if (mimeType && exactMimeTypes.includes(mimeType)) {
            return true;
        }

        if (mimeType && wildcardMimePrefixes.some((prefix) => mimeType.startsWith(prefix))) {
            return true;
        }

        if (!mimeType && hasMimeRestrictions) {
            return true;
        }

        return extensions.some((extension) => fileName.endsWith(extension));
    });

    if (!allValid) {
        return { isValid: false, errorCode: FileValidationErrorCode.InvalidFileType };
    }

    return { isValid: true };
}
