// (C) 2026 GoodData Corporation

import {
    ComponentTable,
    type IUiToolbarSelectProps,
    UiToolbarSelect,
    propCombinationsFor,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

import { FocusOnMount, FontSelect, ToolbarStoryFrame } from "./_helpers/toolbarStories.js";

const propCombination = propCombinationsFor({ label: "Inter" } as IUiToolbarSelectProps);
const longLabel = propCombinationsFor({
    label: "A very long user generated font family name",
} as IUiToolbarSelectProps);

const widths = propCombination("width", ["hug", "fixed"]);
const placeholder = propCombination("isPlaceholder", [true], { label: "Choose a font" });
const open = propCombination("isOpen", [true]);
const disabled = propCombination("isDisabled", [true]);
const truncated = longLabel("width", ["hug", "fixed"]);

function UiToolbarSelectTest({ showCode }: { showCode?: boolean }) {
    return (
        <ToolbarStoryFrame>
            <ComponentTable
                columnsBy={widths}
                rowsBy={[propCombination("isOpen", [false]), placeholder, open, disabled]}
                Component={UiToolbarSelect}
                codeSnippet={showCode ? "UiToolbarSelect" : undefined}
                align="flex-start"
                cellWidth={300}
            />
            <ComponentTable
                rowsBy={[truncated]}
                Component={UiToolbarSelect}
                codeSnippet={showCode ? "UiToolbarSelect" : undefined}
                align="flex-start"
                cellWidth={300}
            />
        </ToolbarStoryFrame>
    );
}

export default {
    title: "15 Ui/UiToolbarSelect",
};

export function Default() {
    return <UiToolbarSelectTest />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interactions() {
    return (
        <ToolbarStoryFrame style={{ gridTemplateColumns: "repeat(2, max-content)" }}>
            <UiToolbarSelect label="Hover me" dataTestId="s-hover" />
            <FocusOnMount selector='[data-testid="s-focus"]'>
                <UiToolbarSelect label="Focused" dataTestId="s-focus" />
            </FocusOnMount>
        </ToolbarStoryFrame>
    );
}
Interactions.parameters = {
    kind: "interactions",
    screenshots: {
        focus: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            postInteractionWait: { selector: '[data-testid="s-focus"]:focus' },
        },
        hover: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            hoverSelector: '[data-testid="s-hover"]',
            postInteractionWait: { delay: 400 },
        },
    },
} satisfies IStoryParameters;

export function WithDropdown() {
    return (
        <ToolbarStoryFrame style={{ minHeight: 260 }}>
            <FontSelect width="fixed" openOnInit />
        </ToolbarStoryFrame>
    );
}
WithDropdown.parameters = {
    kind: "with-dropdown",
    screenshot: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        postInteractionWait: { selector: '[role="listbox"]', delay: 200 },
    },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiToolbarSelectTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interface() {
    return <UiToolbarSelectTest showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
