// (C) 2026 GoodData Corporation

import { action } from "storybook/actions";

import { FilePickerButton } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

const onFilesSelected = action("onFilesSelected");

function FilePickerButtonExamples() {
    return (
        <div className="library-component screenshot-target">
            <h4>Default</h4>
            <FilePickerButton buttonLabel="Choose file" onFilesSelected={onFilesSelected} />

            <h4>With accepted file types</h4>
            <FilePickerButton
                buttonLabel="Upload CSV"
                acceptedFileTypes=".csv"
                onFilesSelected={onFilesSelected}
            />

            <h4>Multiple files</h4>
            <FilePickerButton buttonLabel="Select files" multiple onFilesSelected={onFilesSelected} />

            <h4>Disabled</h4>
            <FilePickerButton buttonLabel="Upload disabled" disabled onFilesSelected={onFilesSelected} />
        </div>
    );
}

export default {
    title: "12 UI Kit/FileUpload/FilePickerButton",
};

export function FullFeatured() {
    return <FilePickerButtonExamples />;
}
FullFeatured.parameters = {
    kind: "full-featured",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<FilePickerButtonExamples />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
