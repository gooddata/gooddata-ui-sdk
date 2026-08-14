// (C) 2026 GoodData Corporation

import { UiSubmenuHeader } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

function Example({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <>
            <h4>{title}</h4>
            <div style={{ width: 300 }}>{children}</div>
        </>
    );
}

/**
 * The three height variants side by side. `small` (35px) is what a small `UiMenu`'s drill-in header
 * uses, `large` (40px) a medium menu's; `medium` (36px) exists for standalone consumers.
 */
function UiSubmenuHeaderExamples() {
    return (
        <div className="library-component screenshot-target">
            <Example title="Small — 35px">
                <UiSubmenuHeader
                    title="Variables"
                    height="small"
                    onBack={() => {}}
                    onClose={() => {}}
                    backAriaLabel="Back to the parent menu"
                    closeAriaLabel="Close menu"
                />
            </Example>

            <Example title="Medium — 36px">
                <UiSubmenuHeader
                    title="Variables"
                    height="medium"
                    onBack={() => {}}
                    onClose={() => {}}
                    backAriaLabel="Back to the parent menu"
                    closeAriaLabel="Close menu"
                />
            </Example>

            <Example title="Large — 40px">
                <UiSubmenuHeader
                    title="Variables"
                    height="large"
                    onBack={() => {}}
                    onClose={() => {}}
                    backAriaLabel="Back to the parent menu"
                    closeAriaLabel="Close menu"
                />
            </Example>

            <Example title="Without back button">
                <UiSubmenuHeader
                    title="Variables"
                    height="small"
                    onClose={() => {}}
                    closeAriaLabel="Close menu"
                />
            </Example>
        </div>
    );
}

export default {
    title: "15 Ui/UiSubmenuHeader",
};

export function Default() {
    return <UiSubmenuHeaderExamples />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiSubmenuHeaderExamples />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
