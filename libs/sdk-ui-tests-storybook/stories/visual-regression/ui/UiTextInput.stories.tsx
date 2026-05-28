// (C) 2026 GoodData Corporation

import { useState } from "react";

import { action } from "storybook/actions";

import { UiTextInput } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

function UiTextInputExample() {
    const [search, setSearch] = useState("");
    const [name, setName] = useState("");
    return (
        <div
            className="screenshot-target"
            style={{ display: "flex", flexDirection: "column", gap: 16, width: 400, padding: 16 }}
        >
            <UiTextInput
                type="search"
                value={search}
                onChange={(next) => {
                    action("search change")(next);
                    setSearch(next);
                }}
                label="User or group"
                placeholder="Search"
            />
            <UiTextInput
                value={name}
                onChange={(next) => {
                    action("name change")(next);
                    setName(next);
                }}
                label="Name"
                placeholder="Jane Good"
            />
            <UiTextInput
                value="filled"
                onChange={action("ignored")}
                label="With trailing clear"
                onIconAfter={{ icon: "cross", onClick: action("clear"), ariaLabel: "Clear" }}
            />
            <UiTextInput value="cannot edit" onChange={action("ignored")} label="Disabled" disabled />
        </div>
    );
}

export default {
    title: "15 Ui/UiTextInput",
};

export function Default() {
    return <UiTextInputExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiTextInputExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
