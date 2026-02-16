// (C) 2020-2026 GoodData Corporation

import {
    ComponentTable,
    UiIconButton,
    type UiIconButtonProps,
    propCombinationsFor,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const propCombination = propCombinationsFor({
    label: "Icon Button Label",
    icon: "plus",
} as UiIconButtonProps);

const propCombinationTertiary = propCombinationsFor({
    label: "Icon Button Label",
    icon: "plus",
    variant: "tertiary",
} as UiIconButtonProps);

const sizes = propCombination("size", ["small", "medium", "large"]);
const variants = propCombination("variant", [
    "primary",
    "secondary",
    "tertiary",
    "popout",
    "danger",
    "table",
    "bare",
]);
const disabled = propCombination("isDisabled", [true]);
const active = propCombination("isActive", [true]);
const destructive = propCombinationTertiary("isDesctructive", [false, true]);

function UiIconButtonTest({ showCode }: { showCode?: boolean }) {
    return (
        <div className="screenshot-target">
            <ComponentTable
                columnsBy={variants}
                rowsBy={[sizes, disabled, active]}
                Component={UiIconButton}
                codeSnippet={showCode ? "UiIconButton" : undefined}
                align="center"
                cellWidth={200}
            />
        </div>
    );
}

function UiIconButtonDestructiveTertiaryTest() {
    return (
        <div className="screenshot-target">
            <ComponentTable
                columnsBy={destructive}
                rowsBy={[sizes, disabled, active]}
                Component={UiIconButton}
                align="center"
                cellWidth={200}
            />
        </div>
    );
}

export default {
    title: "15 Ui/UiIconButton",
};

export function Default() {
    return <UiIconButtonTest />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiIconButtonTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function DestructiveTertiary() {
    return <UiIconButtonDestructiveTertiaryTest />;
}
DestructiveTertiary.parameters = {
    kind: "destructiveTertiary",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interface() {
    return <UiIconButtonTest showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
