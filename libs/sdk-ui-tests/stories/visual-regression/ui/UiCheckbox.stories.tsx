// (C) 2025 GoodData Corporation

import { ComponentTable, UiCheckbox, type UiCheckboxProps, propCombinationsFor } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

// eslint-disable-next-line no-restricted-exports
export default {
    title: "15 Ui/UiCheckbox",
};

const propCombination = propCombinationsFor({} as UiCheckboxProps);

const checked = propCombination("checked", [false, true]);
const indeterminate = propCombination("indeterminate", [true, false], { checked: true });
const labeled = propCombination("label", ["Checkbox with label"], { checked: true });

function UiCheckboxExample({ showCode }: { showCode?: boolean }) {
    return (
        <div className="screenshot-target">
            <ComponentTable
                rowsBy={[checked, indeterminate, labeled]}
                Component={UiCheckbox}
                codeSnippet={showCode ? "UiCheckbox" : undefined}
            />
        </div>
    );
}

export function Default() {
    return <UiCheckboxExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiCheckboxExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interface() {
    return <UiCheckboxExample showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
