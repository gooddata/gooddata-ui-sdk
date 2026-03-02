// (C) 2026 GoodData Corporation

import { action } from "storybook/actions";

import { withIntl } from "@gooddata/sdk-ui";
import { type IUploadFileItem, UploadFileList, UploadItemStatus } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

const onRemoveFile = action("onRemoveFile");
const onRetryFile = action("onRetryFile");

const createMockFile = (name: string): File =>
    new File([""], name, { type: "text/csv", lastModified: Date.now() });

const idleFiles: IUploadFileItem[] = [
    { id: "1", file: createMockFile("data.csv"), status: UploadItemStatus.Idle },
    { id: "2", file: createMockFile("report.csv"), status: UploadItemStatus.Idle },
];

const mixedFiles: IUploadFileItem[] = [
    { id: "1", file: createMockFile("uploaded.csv"), status: UploadItemStatus.Success },
    { id: "2", file: createMockFile("uploading.csv"), status: UploadItemStatus.Uploading },
    {
        id: "3",
        file: createMockFile("failed.csv"),
        status: UploadItemStatus.Error,
        errorMessage: "Network error",
    },
    { id: "4", file: createMockFile("pending.csv"), status: UploadItemStatus.Idle },
];

const errorFiles: IUploadFileItem[] = [
    {
        id: "1",
        file: createMockFile("invalid.txt"),
        status: UploadItemStatus.Error,
        errorMessage: "Invalid file format",
    },
    {
        id: "2",
        file: createMockFile("toolarge.csv"),
        status: UploadItemStatus.Error,
        errorMessage: "File exceeds maximum size",
    },
];

function UploadFileListExamples() {
    return (
        <div className="library-component screenshot-target">
            <h4>Idle files</h4>
            <UploadFileList files={idleFiles} onRemoveFile={onRemoveFile} />

            <h4>Mixed statuses</h4>
            <UploadFileList files={mixedFiles} onRemoveFile={onRemoveFile} onRetryFile={onRetryFile} />

            <h4>Error files with retry</h4>
            <UploadFileList files={errorFiles} onRemoveFile={onRemoveFile} onRetryFile={onRetryFile} />

            <h4>Empty state with label</h4>
            <UploadFileList files={[]} emptyStateLabel="No files selected" />

            <h4>Empty state without label</h4>
            <UploadFileList files={[]} />
        </div>
    );
}

const WithIntl = withIntl(UploadFileListExamples);

export default {
    title: "12 UI Kit/FileUpload/UploadFileList",
};

export function FullFeatured() {
    return <WithIntl />;
}
FullFeatured.parameters = {
    kind: "full-featured",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<WithIntl />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
