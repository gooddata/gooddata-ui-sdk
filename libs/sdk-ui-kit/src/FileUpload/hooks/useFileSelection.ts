// (C) 2026 GoodData Corporation

import { type Dispatch, type SetStateAction, useCallback, useState } from "react";

import { type IFileRejection, type IFileValidationResult, type IFileValidationRules } from "../types.js";
import { validateFile } from "./validateFile.js";

/**
 * @internal
 */
export interface IUseFileSelectionConfig {
    rules?: IFileValidationRules;
    multiple?: boolean;
    onValidateFile?: (file: File) => IFileValidationResult;
    onFilesAccepted?: (files: File[]) => void;
    onFilesRejected?: (rejections: IFileRejection[]) => void;
}

/**
 * @internal
 */
export interface IUseFileSelectionResult {
    selectedFiles: File[];
    rejections: IFileRejection[];
    selectFiles: (files: File[] | FileList | null | undefined) => void;
    setSelectedFiles: Dispatch<SetStateAction<File[]>>;
    removeFile: (file: File) => void;
    clearSelection: () => void;
}

const toArray = (files: File[] | FileList | null | undefined): File[] => {
    if (!files) {
        return [];
    }

    if (Array.isArray(files)) {
        return files;
    }

    return Array.from(files);
};

/**
 * @internal
 */
export function useFileSelection({
    rules,
    multiple = false,
    onValidateFile,
    onFilesAccepted,
    onFilesRejected,
}: IUseFileSelectionConfig = {}): IUseFileSelectionResult {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [rejections, setRejections] = useState<IFileRejection[]>([]);

    const selectFiles = useCallback(
        (files: File[] | FileList | null | undefined) => {
            const filesToProcess = toArray(files);
            const acceptedFiles: File[] = [];
            const rejectedFiles: IFileRejection[] = [];

            filesToProcess.forEach((file) => {
                const validation = onValidateFile ? onValidateFile(file) : validateFile(file, rules);
                if (validation.isValid) {
                    acceptedFiles.push(file);
                } else {
                    rejectedFiles.push({
                        file,
                        validation,
                    });
                }
            });

            setRejections(rejectedFiles);
            setSelectedFiles((previousFiles) => {
                if (!acceptedFiles.length) {
                    return previousFiles;
                }

                return multiple ? [...previousFiles, ...acceptedFiles] : [acceptedFiles[0]];
            });

            if (acceptedFiles.length) {
                onFilesAccepted?.(multiple ? acceptedFiles : [acceptedFiles[0]]);
            }

            if (rejectedFiles.length) {
                onFilesRejected?.(rejectedFiles);
            }
        },
        [multiple, onFilesAccepted, onFilesRejected, onValidateFile, rules],
    );

    const removeFile = useCallback((file: File) => {
        setSelectedFiles((previousFiles) => previousFiles.filter((selectedFile) => selectedFile !== file));
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedFiles([]);
        setRejections([]);
    }, []);

    return {
        selectedFiles,
        rejections,
        selectFiles,
        setSelectedFiles,
        removeFile,
        clearSelection,
    };
}
