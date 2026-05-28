// (C) 2026 GoodData Corporation

import { useState } from "react";

import { action } from "storybook/actions";

import { UiRadioRow } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

function UiRadioRowExample() {
    const [picked, setPicked] = useState<"a" | "b">("a");
    return (
        <div className="screenshot-target" style={{ width: 560 }}>
            <UiRadioRow
                name="example"
                value="a"
                checked={picked === "a"}
                title="Restricted"
                description="Only people and groups added above can access this object."
                onChange={() => {
                    action("pick a")();
                    setPicked("a");
                }}
            />
            <UiRadioRow
                name="example"
                value="b"
                checked={picked === "b"}
                title="All workspace members"
                description="Everyone in this workspace can view this object."
                onChange={() => {
                    action("pick b")();
                    setPicked("b");
                }}
                trailing={<span style={{ color: "var(--gd-palette-complementary-6)" }}>controls →</span>}
            />
        </div>
    );
}

export default {
    title: "15 Ui/UiRadioRow",
};

export function Default() {
    return <UiRadioRowExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiRadioRowExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
