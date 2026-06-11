// (C) 2026 GoodData Corporation

import { action } from "storybook/actions";

import { UiModalDialog } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

function SampleCard() {
    return (
        <div
            role="document"
            style={{
                width: 480,
                padding: 24,
                background: "var(--gd-palette-complementary-0)",
                borderRadius: 4,
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                font: "var(--gd-typo-base-font)",
            }}
        >
            <h2 style={{ marginTop: 0 }}>Sample modal</h2>
            <p>
                The modal primitive renders the dimmed backdrop, traps focus, dismisses on Esc and backdrop
                click, and portals out of the caller's subtree.
            </p>
        </div>
    );
}

function UiModalDialogExample() {
    return (
        <div className="screenshot-target" style={{ minHeight: 400 }}>
            <UiModalDialog isOpen onClose={action("close")}>
                <SampleCard />
            </UiModalDialog>
        </div>
    );
}

export default {
    title: "15 Ui/UiModalDialog",
};

export function Default() {
    return <UiModalDialogExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiModalDialogExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
