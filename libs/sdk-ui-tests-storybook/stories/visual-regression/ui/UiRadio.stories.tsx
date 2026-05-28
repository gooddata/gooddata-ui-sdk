// (C) 2026 GoodData Corporation

import { useState } from "react";

import { action } from "storybook/actions";

import { UiRadio } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

function UiRadioExample() {
    const [picked, setPicked] = useState<"a" | "b">("a");
    return (
        <div
            className="screenshot-target"
            style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}
        >
            <UiRadio
                checked={picked === "a"}
                onChange={() => {
                    action("pick a")();
                    setPicked("a");
                }}
                name="group"
                value="a"
                label="Option A"
            />
            <UiRadio
                checked={picked === "b"}
                onChange={() => {
                    action("pick b")();
                    setPicked("b");
                }}
                name="group"
                value="b"
                label="Option B"
            />
            <UiRadio checked={false} disabled label="Disabled unchecked" />
            <UiRadio checked disabled label="Disabled checked" />
        </div>
    );
}

export default {
    title: "15 Ui/UiRadio",
};

export function Default() {
    return <UiRadioExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiRadioExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
