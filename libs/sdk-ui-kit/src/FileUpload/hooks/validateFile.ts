// (C) 2026 GoodData Corporation

import { parseAcceptedTypes } from "../parseAcceptedTypes.js";
import { FileValidationErrorCode, type IFileValidationResult, type IFileValidationRules } from "../types.js";

const getFileExtension = (fileName: string): string => {
    const extension = fileName.split(".").pop();
    if (!extension || extension === fileName) {
        return "";
    }

    return `.${extension.toLowerCase().trim()}`;
};

/**
 * @internal
 */
export function validateFile(file: File, rules?: IFileValidationRules): IFileValidationResult {
    if (!rules) {
        return { isValid: true };
    }

    const { allowedFileTypes, maxFileSizeInBytes } = rules;
    const { wildcardMimePrefixes, exactMimeTypes, extensions } = parseAcceptedTypes(allowedFileTypes ?? "");

    const hasTypeRestrictions =
        extensions.length > 0 || exactMimeTypes.length > 0 || wildcardMimePrefixes.length > 0;

    if (hasTypeRestrictions) {
        const fileExtension = getFileExtension(file.name);
        const mimeType = file.type?.toLowerCase();
        const hasMimeRestrictions = exactMimeTypes.length > 0 || wildcardMimePrefixes.length > 0;

        const isValidByExtension = extensions.length > 0 && extensions.includes(fileExtension);
        const isValidByExactMime =
            exactMimeTypes.length > 0 && !!mimeType && exactMimeTypes.includes(mimeType);
        const isValidByWildcard =
            wildcardMimePrefixes.length > 0 &&
            !!mimeType &&
            wildcardMimePrefixes.some((prefix) => mimeType.startsWith(prefix));
        const isMissingMimeTypeWithMimeRestrictions = !mimeType && hasMimeRestrictions;
        const shouldAllowUnknownMimeType = isMissingMimeTypeWithMimeRestrictions;

        if (!isValidByExtension && !isValidByExactMime && !isValidByWildcard && !shouldAllowUnknownMimeType) {
            return {
                isValid: false,
                errorCode: FileValidationErrorCode.InvalidFileType,
            };
        }
    }

    if (maxFileSizeInBytes !== undefined && file.size > maxFileSizeInBytes) {
        return {
            isValid: false,
            errorCode: FileValidationErrorCode.FileTooLarge,
        };
    }

    return { isValid: true };
}
