// (C) 2025 GoodData Corporation

import { ComponentTable, UiCheckbox, UiCheckboxProps, propCombinationsFor } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../themeWrapper.js";

export default {
    title: "15 Ui/UiCheckbox",
};

const propCombination = propCombinationsFor({} as UiCheckboxProps);

const checked = propCombination("checked", [false, true]);
const indeterminate = propCombination("indeterminate", [true, false], { checked: true });

function UiCheckboxExample({ showCode }: { showCode?: boolean }) {
    return (
        <div className="screenshot-target">
            <ComponentTable
                rowsBy={[checked, indeterminate]}
                Component={UiCheckbox}
                codeSnippet={showCode ? "UiCheckbox" : undefined}
            />
        </div>
    );
}

export function Default() {
    return <UiCheckboxExample />;
}
Default.parameters = { kind: "default", screenshot: true };

export const Themed = () => wrapWithTheme(<UiCheckboxExample />);
Themed.parameters = { kind: "themed", screenshot: true };

export function Interface() {
    return <UiCheckboxExample showCode />;
}
Interface.parameters = { kind: "interface" };
