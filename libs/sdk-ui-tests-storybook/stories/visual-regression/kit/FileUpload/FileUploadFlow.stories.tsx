// (C) 2026 GoodData Corporation

import { useState } from "react";

import { withIntl } from "@gooddata/sdk-ui";
import {
    FileDropzone,
    FilePickerButton,
    FileValidationErrorCode,
    type IFileValidationRules,
    UploadFileList,
    UploadItemStatus,
    UploadStatusDialog,
    useFileSelection,
    useUploadQueue,
    validateFile,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters } from "../../../_infra/backstopScenario.js";

function FileUploadFlowExample() {
    // Configuration state
    const [acceptedFileTypes, setAcceptedFileTypes] = useState<string>("");
    const [multiple, setMultiple] = useState<boolean>(true);
    const [shouldFailUpload, setShouldFailUpload] = useState<boolean>(false);
    const [maxFileSizeMB, setMaxFileSizeMB] = useState<number>(1);

    // Validation rules
    const validationRules: IFileValidationRules = {
        allowedFileTypes: acceptedFileTypes,
        maxFileSizeInBytes: maxFileSizeMB * 1024 * 1024,
    };

    // Mock upload function
    const uploadFn = async (_file: File): Promise<void> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (shouldFailUpload) {
                    reject(new Error("Network error: Upload failed"));
                } else {
                    resolve();
                }
            }, 2000);
        });
    };

    // File selection hook
    const { rejections, selectFiles, setSelectedFiles } = useFileSelection({
        rules: validationRules,
        multiple,
        onValidateFile: (file) => validateFile(file, validationRules),
        onFilesAccepted: (files) => {
            addToQueue(files);
            setSelectedFiles([]);
        },
    });

    // Upload queue hook
    const { queue, addToQueue, removeFromQueue, uploadAll, uploadFile } = useUploadQueue({
        uploadFn,
    });
    const uploadingFile = queue.find((f) => f.status === UploadItemStatus.Uploading);

    return (
        <div className="library-component screenshot-target" style={{ padding: "20px" }}>
            <h2>File Upload Flow - End-to-End Test</h2>

            {/* Configuration Panel */}
            <div
                style={{
                    padding: "15px",
                    marginBottom: "20px",
                    border: "1px solid #dde4eb",
                    borderRadius: "3px",
                    backgroundColor: "#f5f8fa",
                }}
            >
                <h3 style={{ marginTop: 0 }}>Configuration</h3>

                <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: 600 }}>
                        Accepted File Types:
                    </label>
                    <input
                        type="text"
                        value={acceptedFileTypes}
                        onChange={(e) => setAcceptedFileTypes(e.target.value)}
                        placeholder="e.g., text/csv"
                        style={{
                            width: "100%",
                            padding: "5px 10px",
                            border: "1px solid #dde4eb",
                            borderRadius: "3px",
                        }}
                    />
                    <small style={{ color: "#94a1ad" }}>
                        Comma-separated list (e.g., text/csv,.txt,image/*)
                    </small>
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: 600 }}>
                        Max File Size (MB):
                    </label>
                    <input
                        type="number"
                        value={maxFileSizeMB}
                        onChange={(e) => setMaxFileSizeMB(Number(e.target.value))}
                        min="1"
                        max="100"
                        style={{
                            width: "100%",
                            padding: "5px 10px",
                            border: "1px solid #dde4eb",
                            borderRadius: "3px",
                        }}
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                            type="checkbox"
                            checked={multiple}
                            onChange={(e) => setMultiple(e.target.checked)}
                        />
                        <span style={{ fontWeight: 600 }}>Allow multiple files</span>
                    </label>
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                            type="checkbox"
                            checked={shouldFailUpload}
                            onChange={(e) => setShouldFailUpload(e.target.checked)}
                        />
                        <span style={{ fontWeight: 600 }}>Simulate upload failure</span>
                    </label>
                </div>
            </div>

            {/* Step 1: File Selection */}
            <div style={{ marginBottom: "30px" }}>
                <h3>Step 1: Select Files</h3>

                <div style={{ marginBottom: "15px" }}>
                    <h4>Option A: Drag & Drop Zone</h4>
                    <FileDropzone
                        idleLabel={
                            <span>
                                Drag & drop {acceptedFileTypes || "files"} here
                                <br />
                                or click to browse
                            </span>
                        }
                        invalidLabel={(errorCode) => {
                            switch (errorCode) {
                                case FileValidationErrorCode.FileTooLarge:
                                    return "File too large";
                                case FileValidationErrorCode.TooManyFiles:
                                    return "Too many files";
                                case FileValidationErrorCode.InvalidFileType:
                                    return "Invalid file type";
                                default:
                                    return "Invalid file";
                            }
                        }}
                        activeLabel="Drop files here"
                        acceptedFileTypes={acceptedFileTypes}
                        multiple={multiple}
                        onFilesSelected={selectFiles}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <h4>Option B: File Picker Button</h4>
                    <FilePickerButton
                        buttonLabel="Choose Files"
                        acceptedFileTypes={acceptedFileTypes}
                        multiple={multiple}
                        onFilesSelected={selectFiles}
                    />
                </div>

                {rejections.length > 0 && (
                    <div
                        style={{
                            marginTop: "15px",
                            padding: "10px",
                            backgroundColor: "#fff3f2",
                            borderRadius: "3px",
                        }}
                    >
                        <h4 style={{ color: "#e54d42", marginTop: 0 }}>Validation Errors:</h4>
                        <ul style={{ color: "#e54d42", margin: 0 }}>
                            {rejections.map((rejection, idx) => (
                                <li key={idx}>
                                    <strong>{rejection.file.name}</strong>:{" "}
                                    {rejection.validation.errorCode ===
                                        FileValidationErrorCode.InvalidFileType && "Invalid file type"}
                                    {rejection.validation.errorCode ===
                                        FileValidationErrorCode.FileTooLarge && "File too large"}
                                    {rejection.validation.errorCode ===
                                        FileValidationErrorCode.TooManyFiles && "Too many files"}
                                    {!rejection.validation.errorCode && "Unknown error"}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Step 2: Upload Queue */}
            <div style={{ marginBottom: "30px" }}>
                <h3>Step 2: Upload Queue</h3>

                {queue.length > 0 ? (
                    <>
                        <UploadFileList
                            files={queue}
                            onRemoveFile={removeFromQueue}
                            onRetryFile={uploadFile}
                        />

                        <div style={{ marginTop: "15px" }}>
                            <button
                                onClick={uploadAll}
                                disabled={queue.every((f) => f.status === UploadItemStatus.Success)}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#00c18d",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "3px",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    opacity: queue.every((f) => f.status === UploadItemStatus.Success)
                                        ? 0.5
                                        : 1,
                                }}
                            >
                                Upload All Files
                            </button>
                        </div>
                    </>
                ) : (
                    <p style={{ color: "#94a1ad", fontStyle: "italic" }}>No files in queue</p>
                )}
            </div>

            {/* Step 3: Upload Status Dialog */}
            <UploadStatusDialog
                isOpen={!!uploadingFile}
                title={"Uploading file"}
                fileName={uploadingFile?.file.name}
                status={uploadingFile?.status ?? UploadItemStatus.Idle}
            />
        </div>
    );
}

const WithIntl = withIntl(FileUploadFlowExample);

export default {
    title: "12 UI Kit/FileUpload/FileUploadFlow",
};

export function EndToEndFlow() {
    return <WithIntl />;
}
EndToEndFlow.parameters = {
    kind: "end-to-end-flow",
} satisfies IStoryParameters;
