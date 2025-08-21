// (C) 2025 GoodData Corporation

import { ComponentTable, propCombinationsFor, UiCheckbox, UiCheckboxProps } from "@gooddata/sdk-ui-kit";
import React from "react";
import { wrapWithTheme } from "../themeWrapper.js";

export default {
    title: "15 Ui/UiCheckbox",
};

const propCombination = propCombinationsFor({} as UiCheckboxProps);

const checked = propCombination("checked", [false, true]);
const indeterminate = propCombination("indeterminate", [true, false], { checked: true });

const UiCheckboxExample = ({ showCode }: { showCode?: boolean }) => (
    <div className="screenshot-target">
        <ComponentTable
            rowsBy={[checked, indeterminate]}
            Component={UiCheckbox}
            codeSnippet={showCode ? "UiCheckbox" : undefined}
        />
    </div>
);

export const Default = () => <UiCheckboxExample />;
Default.parameters = { kind: "default", screenshot: true };

export const Themed = () => wrapWithTheme(<UiCheckboxExample />);
Themed.parameters = { kind: "themed", screenshot: true };

export const Interface = () => <UiCheckboxExample showCode />;
Interface.parameters = { kind: "interface" };
