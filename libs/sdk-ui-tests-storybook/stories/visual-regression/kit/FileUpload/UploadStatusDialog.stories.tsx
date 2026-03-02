// (C) 2026 GoodData Corporation

import { UploadItemStatus, UploadStatusDialog } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

function UploadStatusDialogIdleExample() {
    return (
        <div className="library-component screenshot-target">
            <h4>Idle</h4>
            <UploadStatusDialog
                isOpen
                title="Waiting to upload the file"
                fileName="Abbreviations.txt"
                status={UploadItemStatus.Idle}
            />
        </div>
    );
}

function UploadStatusDialogUploadingExample() {
    return (
        <div className="library-component screenshot-target">
            <h4>Uploading</h4>
            <UploadStatusDialog
                isOpen
                title="Uploading the file"
                fileName="Abbreviations.txt"
                status={UploadItemStatus.Uploading}
            />
        </div>
    );
}

function UploadStatusDialogSuccessExample() {
    return (
        <div className="library-component screenshot-target">
            <h4>Success</h4>
            <UploadStatusDialog
                isOpen
                title="Upload complete"
                fileName="data.csv"
                status={UploadItemStatus.Success}
            />
        </div>
    );
}

function UploadStatusDialogErrorExample() {
    return (
        <div className="library-component screenshot-target">
            <h4>Error</h4>
            <UploadStatusDialog
                isOpen
                title="Upload failed"
                fileName="data.csv"
                status={UploadItemStatus.Error}
            />
        </div>
    );
}

export default {
    title: "12 UI Kit/FileUpload/UploadStatusDialog",
};

export function Uploading() {
    return <UploadStatusDialogUploadingExample />;
}
Uploading.parameters = {
    kind: "uploading",
    // Since we have an infinite animation in the uploading state, screenshotting is problematic
} satisfies IStoryParameters;

export function Idle() {
    return <UploadStatusDialogIdleExample />;
}
Idle.parameters = {
    kind: "idle",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Success() {
    return <UploadStatusDialogSuccessExample />;
}
Success.parameters = {
    kind: "success",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Error() {
    return <UploadStatusDialogErrorExample />;
}
Error.parameters = {
    kind: "error",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UploadStatusDialogIdleExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
