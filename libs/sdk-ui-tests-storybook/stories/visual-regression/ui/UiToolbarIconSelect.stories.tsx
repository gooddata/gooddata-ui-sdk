// (C) 2026 GoodData Corporation

import {
    ComponentTable,
    type IUiToolbarIconSelectProps,
    UiToolbarColorSwatch,
    UiToolbarIconSelect,
    propCombinationsFor,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

import { FocusOnMount, ToolbarStoryFrame } from "./_helpers/toolbarStories.js";

const propCombination = propCombinationsFor({ label: "Fill colour" } as IUiToolbarIconSelectProps);

const icons = propCombination("icon", [
    undefined,
    <UiToolbarColorSwatch key="fill" variant="fill" color="#e54d42" />,
    <UiToolbarColorSwatch key="transparent" variant="fill" isTransparent hasBorder />,
    <UiToolbarColorSwatch key="text" variant="text" color="#14b2e2" />,
    "bold",
]);
const open = propCombination("isOpen", [true]);
const selected = propCombination("isSelected", [true]);
const disabled = propCombination("isDisabled", [true]);

function UiToolbarIconSelectTest({ showCode }: { showCode?: boolean }) {
    return (
        <ToolbarStoryFrame>
            <ComponentTable
                columnsBy={icons}
                rowsBy={[propCombination("isOpen", [false]), open, selected, disabled]}
                Component={UiToolbarIconSelect}
                codeSnippet={showCode ? "UiToolbarIconSelect" : undefined}
                align="center"
                cellWidth={120}
            />
        </ToolbarStoryFrame>
    );
}

export default {
    title: "15 Ui/UiToolbarIconSelect",
};

export function Default() {
    return <UiToolbarIconSelectTest />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interactions() {
    return (
        <ToolbarStoryFrame style={{ gridTemplateColumns: "repeat(2, max-content)", paddingTop: 60 }}>
            <UiToolbarIconSelect label="Fill colour" dataTestId="s-hover" />
            <FocusOnMount selector='[data-testid="s-focus"]'>
                <UiToolbarIconSelect
                    icon={<UiToolbarColorSwatch variant="text" color="#14b2e2" />}
                    label="Text colour"
                    dataTestId="s-focus"
                />
            </FocusOnMount>
        </ToolbarStoryFrame>
    );
}
Interactions.parameters = {
    kind: "interactions",
    screenshots: {
        focus: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            postInteractionWait: { selector: ".gd-ui-kit-tooltip" },
        },
        hover: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            hoverSelector: '[data-testid="s-hover"]',
            postInteractionWait: { selector: ".gd-ui-kit-tooltip", delay: 400 },
        },
    },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiToolbarIconSelectTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interface() {
    return <UiToolbarIconSelectTest showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
