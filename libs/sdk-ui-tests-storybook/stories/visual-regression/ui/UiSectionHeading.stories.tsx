// (C) 2026 GoodData Corporation

import { action } from "storybook/actions";

import { UiButton, UiSectionHeading } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

function UiSectionHeadingExample() {
    return (
        <div
            className="screenshot-target"
            style={{ display: "flex", flexDirection: "column", gap: 16, padding: 24, width: 500 }}
        >
            <UiSectionHeading label="Shared with" />
            <UiSectionHeading
                label="Shared with"
                action={
                    <UiButton
                        label="Add"
                        variant="popout"
                        size="small"
                        iconBefore="plus"
                        onClick={action("add")}
                    />
                }
            />
            <UiSectionHeading label="General access" />
        </div>
    );
}

export default {
    title: "15 Ui/UiSectionHeading",
};

export function Default() {
    return <UiSectionHeadingExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiSectionHeadingExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
