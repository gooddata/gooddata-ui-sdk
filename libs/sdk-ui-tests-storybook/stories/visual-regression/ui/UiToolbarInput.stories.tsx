// (C) 2026 GoodData Corporation

import {
    ComponentTable,
    type IUiToolbarInputProps,
    UiToolbarInput,
    propCombinationsFor,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

import { FocusOnMount, ToolbarStoryFrame } from "./_helpers/toolbarStories.js";

const WIDTH_A11Y = { ariaLabel: "Width", unitLabel: "pixels" };

const input = propCombinationsFor({
    value: "120",
    onCommit: () => {},
    unit: "px",
    width: 80,
    accessibilityConfig: WIDTH_A11Y,
} as IUiToolbarInputProps);

function UiToolbarInputTest({ showCode }: { showCode?: boolean }) {
    return (
        <ToolbarStoryFrame>
            <ComponentTable
                columnsBy={input("isDisabled", [false, true])}
                rowsBy={[
                    input("unit", [undefined, "px"]),
                    input("prefix", ["W"]),
                    input("prefixIcon", ["cw"]),
                    input("isInvalid", [true]),
                ]}
                Component={UiToolbarInput}
                codeSnippet={showCode ? "UiToolbarInput" : undefined}
                align="center"
                cellWidth={200}
            />
        </ToolbarStoryFrame>
    );
}

export default {
    title: "15 Ui/UiToolbarInput",
};

export function Default() {
    return <UiToolbarInputTest />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interactions() {
    return (
        <ToolbarStoryFrame style={{ gridTemplateColumns: "repeat(2, max-content)" }}>
            <UiToolbarInput
                value="120"
                onCommit={() => {}}
                prefix="W"
                unit="px"
                width={80}
                accessibilityConfig={WIDTH_A11Y}
                dataTestId="s-hover"
            />
            <FocusOnMount selector='[data-testid="s-focus"] input'>
                <UiToolbarInput
                    value="120"
                    onCommit={() => {}}
                    prefix="W"
                    unit="px"
                    width={80}
                    accessibilityConfig={WIDTH_A11Y}
                    dataTestId="s-focus"
                />
            </FocusOnMount>
        </ToolbarStoryFrame>
    );
}
Interactions.parameters = {
    kind: "interactions",
    screenshots: {
        focused: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            postInteractionWait: { selector: '[data-testid="s-focus"] input:focus' },
        },
        hovered: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            hoverSelector: '[data-testid="s-hover"]',
            postInteractionWait: { delay: 400 },
        },
    },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiToolbarInputTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interface() {
    return <UiToolbarInputTest showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
