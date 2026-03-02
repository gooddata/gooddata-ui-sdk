// (C) 2026 GoodData Corporation

import { action } from "storybook/actions";

import { FileDropzone, FileValidationErrorCode } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

const onFilesSelected = action("onFilesSelected");

function FileDropzoneExamples() {
    return (
        <div className="library-component screenshot-target">
            <h4>Default</h4>
            <FileDropzone
                idleLabel="Drag & drop files here or click to browse"
                onFilesSelected={onFilesSelected}
            />

            <h4>With active label</h4>
            <FileDropzone
                idleLabel="Drag & drop files here or click to browse"
                activeLabel="Drop files here"
                onFilesSelected={onFilesSelected}
            />

            <h4>Multiple files</h4>
            <FileDropzone
                idleLabel="Drag & drop CSV files here or click to browse"
                activeLabel="Drop CSV files here"
                acceptedFileTypes=".csv"
                multiple
                onFilesSelected={onFilesSelected}
            />

            <h4>With dynamic invalid label</h4>
            <FileDropzone
                idleLabel="Drag & drop a CSV file here or click to browse"
                activeLabel="Drop CSV file here"
                acceptedFileTypes=".csv,text/csv"
                invalidLabel={(errorCode) => {
                    switch (errorCode) {
                        case FileValidationErrorCode.InvalidFileType:
                            return "Only CSV files are supported";
                        case FileValidationErrorCode.FileTooLarge:
                            return "File size must be less than 1 MB";
                        case FileValidationErrorCode.TooManyFiles:
                            return "Only one file can be uploaded";
                        default:
                            return "Invalid file";
                    }
                }}
                onFilesSelected={onFilesSelected}
            />

            <h4>Disabled</h4>
            <FileDropzone idleLabel="File upload is disabled" disabled onFilesSelected={onFilesSelected} />

            <h4>With custom idle label</h4>
            <FileDropzone
                idleLabel={
                    <span>
                        <strong>Click to upload</strong> or drag and drop
                        <br />
                        This is a custom label
                    </span>
                }
                onFilesSelected={onFilesSelected}
            />
        </div>
    );
}

export default {
    title: "12 UI Kit/FileUpload/FileDropzone",
};

export function FullFeatured() {
    return <FileDropzoneExamples />;
}
FullFeatured.parameters = {
    kind: "full-featured",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<FileDropzoneExamples />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
