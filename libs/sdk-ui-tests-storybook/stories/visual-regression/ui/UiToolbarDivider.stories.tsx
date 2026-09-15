// (C) 2026 GoodData Corporation

import { UiToolbarButton, UiToolbarDivider, UiToolbarIconButton } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

import { ToolbarStoryFrame } from "./_helpers/toolbarStories.js";

function UiToolbarDividerTest() {
    return (
        <ToolbarStoryFrame style={{ justifyItems: "start" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <UiToolbarButton label="Before" />
                <UiToolbarDivider />
                <UiToolbarIconButton icon="bold" label="Bold" />
                <UiToolbarDivider />
                <UiToolbarButton label="After" />
            </div>
        </ToolbarStoryFrame>
    );
}

export default {
    title: "15 Ui/UiToolbarDivider",
};

export function Default() {
    return <UiToolbarDividerTest />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiToolbarDividerTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
