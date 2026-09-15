// (C) 2026 GoodData Corporation

import { UiToolbarButton, UiToolbarIconButton, UiToolbarSegmentedControl } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

import { FocusOnMount, ScopeControl, ToolbarStoryFrame } from "./_helpers/toolbarStories.js";

const LABELS = ["One", "Two", "Three", "Four", "Five"];

function LabelGroup({ segments, value }: { segments: number; value: string }) {
    return (
        <UiToolbarSegmentedControl
            value={value}
            onChange={() => {}}
            accessibilityConfig={{ ariaLabel: "Options" }}
        >
            {LABELS.slice(0, segments).map((label) => (
                <UiToolbarButton key={label} value={label.toLowerCase()} label={label} />
            ))}
        </UiToolbarSegmentedControl>
    );
}

function UiToolbarSegmentedControlTest() {
    return (
        <ToolbarStoryFrame style={{ justifyItems: "start" }}>
            <LabelGroup segments={2} value="one" />
            <LabelGroup segments={3} value="two" />
            <LabelGroup segments={4} value="three" />
            <LabelGroup segments={5} value="five" />
            <UiToolbarSegmentedControl
                value="left"
                onChange={() => {}}
                accessibilityConfig={{ ariaLabel: "Horizontal alignment" }}
            >
                <UiToolbarIconButton value="left" icon="alignLeft" label="Align left" />
                <UiToolbarIconButton value="center" icon="alignCenter" label="Align centre" />
                <UiToolbarIconButton value="right" icon="alignRight" label="Align right" />
            </UiToolbarSegmentedControl>
            <UiToolbarSegmentedControl
                value="cell"
                onChange={() => {}}
                accessibilityConfig={{ ariaLabel: "Scope" }}
                isDisabled
            >
                <UiToolbarButton value="cell" label="Cell" />
                <UiToolbarButton value="row" label="Row" />
            </UiToolbarSegmentedControl>
        </ToolbarStoryFrame>
    );
}

export default {
    title: "15 Ui/UiToolbarSegmentedControl",
};

export function Default() {
    return <UiToolbarSegmentedControlTest />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interactions() {
    return (
        <ToolbarStoryFrame style={{ justifyItems: "start" }}>
            <FocusOnMount selector='[data-testid="s-scope-cell"]'>
                <ScopeControl />
            </FocusOnMount>
        </ToolbarStoryFrame>
    );
}
Interactions.parameters = {
    kind: "interactions",
    screenshots: {
        "checked-focused": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            postInteractionWait: { selector: '[data-testid="s-scope-cell"]:focus' },
        },
        "unchecked-hovered": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            hoverSelector: '[data-testid="s-scope-row"]',
            postInteractionWait: { delay: 400 },
        },
        "arrow-moves-selection": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            delay: { postReady: 500 },
            keyPressSelector: { selector: '[data-testid="s-scope-cell"]', keyPress: "ArrowRight" },
            postInteractionWait: { delay: 400 },
        },
    },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiToolbarSegmentedControlTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
