// (C) 2026 GoodData Corporation

import {
    ComponentTable,
    type IUiToolbarIconButtonProps,
    UiToolbarColorSwatch,
    UiToolbarIconButton,
    propCombinationsFor,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

import { FocusOnMount, ToolbarStoryFrame } from "./_helpers/toolbarStories.js";

const propCombination = propCombinationsFor({ icon: "bold", label: "Bold" } as IUiToolbarIconButtonProps);

const sizes = propCombination("size", ["medium", "small"]);
const selected = propCombination("isSelected", [true]);
const destructive = propCombination("isDestructive", [true]);
const selectedDestructive = propCombination("isDestructive", [true], { isSelected: true });
const active = propCombination("isActive", [true]);
const disabled = propCombination("isDisabled", [true]);
const swatches = propCombination("icon", [
    <UiToolbarColorSwatch key="fill" variant="fill" color="#e54d42" />,
    <UiToolbarColorSwatch key="pale" variant="fill" color="#ffffff" hasBorder />,
    <UiToolbarColorSwatch key="transparent" variant="fill" isTransparent hasBorder />,
    <UiToolbarColorSwatch key="text" variant="text" color="#14b2e2" />,
]);

function UiToolbarIconButtonTest({ showCode }: { showCode?: boolean }) {
    return (
        <ToolbarStoryFrame>
            <ComponentTable
                columnsBy={sizes}
                rowsBy={[selected, destructive, selectedDestructive, active, disabled]}
                Component={UiToolbarIconButton}
                codeSnippet={showCode ? "UiToolbarIconButton" : undefined}
                align="center"
                cellWidth={200}
            />
            <ComponentTable
                rowsBy={[swatches]}
                Component={UiToolbarIconButton}
                codeSnippet={showCode ? "UiToolbarIconButton" : undefined}
                align="center"
                cellWidth={100}
            />
        </ToolbarStoryFrame>
    );
}

export default {
    title: "15 Ui/UiToolbarIconButton",
};

export function Default() {
    return <UiToolbarIconButtonTest />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interactions() {
    return (
        <ToolbarStoryFrame style={{ gridTemplateColumns: "repeat(3, max-content)", paddingTop: 60 }}>
            <UiToolbarIconButton icon="bold" label="Bold" dataTestId="s-hover" />
            <UiToolbarIconButton icon="italic" label="Italic" isSelected dataTestId="s-hover-selected" />
            <FocusOnMount selector='[data-testid="s-focus"]'>
                <UiToolbarIconButton icon="trash" label="Delete" isDestructive dataTestId="s-focus" />
            </FocusOnMount>
        </ToolbarStoryFrame>
    );
}
Interactions.parameters = {
    kind: "interactions",
    screenshots: {
        "focus-shows-tooltip": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            postInteractionWait: { selector: ".gd-ui-kit-tooltip" },
        },
        "hover-shows-tooltip": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            hoverSelector: '[data-testid="s-hover"]',
            postInteractionWait: { selector: ".gd-ui-kit-tooltip", delay: 400 },
        },
    },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiToolbarIconButtonTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interface() {
    return <UiToolbarIconButtonTest showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
