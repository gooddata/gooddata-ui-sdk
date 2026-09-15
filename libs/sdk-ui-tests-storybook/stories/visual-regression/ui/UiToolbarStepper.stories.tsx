// (C) 2026 GoodData Corporation

import {
    ComponentTable,
    type IUiToolbarStepperProps,
    UiToolbarStepper,
    propCombinationsFor,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

import { FocusOnMount, ToolbarStoryFrame, ZoomStepper } from "./_helpers/toolbarStories.js";

const ZOOM_A11Y = { ariaLabel: "Zoom", incrementLabel: "Zoom in", decrementLabel: "Zoom out" };
const PAGE_A11Y = { ariaLabel: "Page", incrementLabel: "Next page", decrementLabel: "Previous page" };

const zoom = propCombinationsFor({
    variant: "value",
    value: "100%",
    onStep: () => {},
    onCommit: () => {},
    accessibilityConfig: ZOOM_A11Y,
} as IUiToolbarStepperProps);
const pagination = propCombinationsFor({
    variant: "pagination",
    value: "1 / 2",
    onStep: () => {},
    accessibilityConfig: PAGE_A11Y,
} as IUiToolbarStepperProps);

function UiToolbarStepperTest({ showCode }: { showCode?: boolean }) {
    return (
        <ToolbarStoryFrame>
            <ComponentTable
                columnsBy={zoom("isOpen", [false, true])}
                rowsBy={[
                    zoom("canStepDown", [true, false]),
                    zoom("canStepUp", [false]),
                    zoom("isDisabled", [true]),
                ]}
                Component={UiToolbarStepper}
                codeSnippet={showCode ? "UiToolbarStepper" : undefined}
                align="center"
                cellWidth={200}
            />
            <ComponentTable
                rowsBy={[
                    pagination("canStepDown", [true, false]),
                    pagination("canStepUp", [false]),
                    pagination("isDisabled", [true]),
                ]}
                Component={UiToolbarStepper}
                codeSnippet={showCode ? "UiToolbarStepper" : undefined}
                align="center"
                cellWidth={200}
            />
        </ToolbarStoryFrame>
    );
}

export default {
    title: "15 Ui/UiToolbarStepper",
};

export function Default() {
    return <UiToolbarStepperTest />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interactions() {
    return (
        <ToolbarStoryFrame style={{ gridTemplateColumns: "repeat(2, max-content)", paddingTop: 60 }}>
            <UiToolbarStepper
                variant="value"
                value="100%"
                onStep={() => {}}
                onCommit={() => {}}
                accessibilityConfig={ZOOM_A11Y}
                dataTestId="s-hover"
            />
            <FocusOnMount selector='[data-testid="s-focus"] input'>
                <UiToolbarStepper
                    variant="value"
                    value="100%"
                    onStep={() => {}}
                    onCommit={() => {}}
                    accessibilityConfig={ZOOM_A11Y}
                    dataTestId="s-focus"
                />
            </FocusOnMount>
        </ToolbarStoryFrame>
    );
}
Interactions.parameters = {
    kind: "interactions",
    screenshots: {
        "value-focused": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            postInteractionWait: { selector: '[data-testid="s-focus"] input:focus' },
        },
        "value-hovered": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            hoverSelector: '[data-testid="s-hover"] input',
            postInteractionWait: { delay: 400 },
        },
        "side-control-hovered": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            hoverSelector: '[data-testid="s-hover"] > :first-child button',
            postInteractionWait: { selector: ".gd-ui-kit-tooltip", delay: 400 },
        },
    },
} satisfies IStoryParameters;

export function WithPresetList() {
    return (
        <ToolbarStoryFrame style={{ minHeight: 300 }}>
            <ZoomStepper openOnInit />
        </ToolbarStoryFrame>
    );
}
WithPresetList.parameters = {
    kind: "with-preset-list",
    screenshot: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        postInteractionWait: { selector: '[role="listbox"]', delay: 200 },
    },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiToolbarStepperTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interface() {
    return <UiToolbarStepperTest showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
