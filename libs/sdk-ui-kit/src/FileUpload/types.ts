// (C) 2026 GoodData Corporation

/**
 * @internal
 */
export const UploadItemStatus = {
    Idle: "idle",
    Uploading: "uploading",
    Success: "success",
    Error: "error",
} as const;

/**
 * @internal
 */
export type UploadItemStatus = (typeof UploadItemStatus)[keyof typeof UploadItemStatus];

/**
 * @internal
 */
export const FileValidationErrorCode = {
    InvalidFileType: "invalidFileType",
    TooManyFiles: "tooManyFiles",
    FileTooLarge: "fileTooLarge",
} as const;

/**
 * @internal
 */
export type FileValidationErrorCode = (typeof FileValidationErrorCode)[keyof typeof FileValidationErrorCode];

/**
 * @internal
 */
export interface IFileValidationRules {
    /**
     * Comma separated list of allowed file types.
     * For example: ".txt,image/*,text/csv"
     */
    allowedFileTypes?: string;
    maxFileSizeInBytes?: number;
}

/**
 * @internal
 */
export interface IFileValidationResult {
    isValid: boolean;
    errorCode?: FileValidationErrorCode;
}

/**
 * @internal
 */
export interface IFileRejection {
    file: File;
    validation: IFileValidationResult;
}

/**
 * @internal
 */
export interface IUploadFileItem {
    id: string;
    file: File;
    status: UploadItemStatus;
    errorMessage?: string;
}

/**
 * @internal
 */
export interface IUploadActionCallbacks {
    onRemoveFile?: (fileId: string) => void;
    onRetryFile?: (fileId: string) => void;
}
