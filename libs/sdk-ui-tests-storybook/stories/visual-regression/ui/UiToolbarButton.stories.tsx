// (C) 2026 GoodData Corporation

import {
    ComponentTable,
    type IUiToolbarButtonProps,
    UiToolbarButton,
    propCombinationsFor,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

import { FocusOnMount, ToolbarStoryFrame } from "./_helpers/toolbarStories.js";

const propCombination = propCombinationsFor({ label: "Label" } as IUiToolbarButtonProps);

const selected = propCombination("isSelected", [false, true]);
const destructive = propCombination("isDestructive", [false, true]);
const active = propCombination("isActive", [true]);
const disabled = propCombination("isDisabled", [true]);

function UiToolbarButtonTest({ showCode }: { showCode?: boolean }) {
    return (
        <ToolbarStoryFrame>
            <ComponentTable
                columnsBy={selected}
                rowsBy={[destructive, active, disabled]}
                Component={UiToolbarButton}
                codeSnippet={showCode ? "UiToolbarButton" : undefined}
                align="center"
                cellWidth={200}
            />
        </ToolbarStoryFrame>
    );
}

export default {
    title: "15 Ui/UiToolbarButton",
};

export function Default() {
    return <UiToolbarButtonTest />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interactions() {
    return (
        <ToolbarStoryFrame style={{ gridTemplateColumns: "repeat(4, max-content)" }}>
            <UiToolbarButton label="Hover me" dataTestId="s-hover" />
            <UiToolbarButton label="Selected" isSelected dataTestId="s-hover-selected" />
            <UiToolbarButton label="Delete" isDestructive dataTestId="s-hover-destructive" />
            <FocusOnMount selector='[data-testid="s-focus"]'>
                <UiToolbarButton label="Focused" dataTestId="s-focus" />
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
        "hover-selected": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            hoverSelector: '[data-testid="s-hover-selected"]',
            postInteractionWait: { delay: 400 },
        },
        "hover-destructive": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            hoverSelector: '[data-testid="s-hover-destructive"]',
            postInteractionWait: { delay: 400 },
        },
    },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiToolbarButtonTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interface() {
    return <UiToolbarButtonTest showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
