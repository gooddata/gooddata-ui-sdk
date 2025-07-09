// (C) 2025 GoodData Corporation

import React from "react";
import {
    propCombinationsFor,
    ComponentTable,
    UiDropdownIconButtonProps,
    UiDropdownIconButton,
} from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../themeWrapper.js";

const propCombination = propCombinationsFor({
    icon: "directionRow",
} as UiDropdownIconButtonProps);

const variants = propCombination("variant", ["primary", "secondary", "tertiary"]);
const sizes = propCombination("size", ["small", "medium", "large"]);
const disabled = propCombination("isDisabled", [true]);
const open = propCombination("isDropdownOpen", [true]);

const UiDropdownIconButtonTest: React.FC<{ showCode?: boolean }> = ({ showCode }) => (
    <div className="screenshot-target">
        <ComponentTable
            columnsBy={variants}
            rowsBy={[sizes, disabled, open]}
            Component={UiDropdownIconButton}
            codeSnippet={showCode ? "UiDropdownIconButton" : undefined}
            align="center"
            cellWidth={250}
        />
    </div>
);

export default {
    title: "15 Ui/UiDropdownIconButton",
};

export const Default = () => <UiDropdownIconButtonTest />;
Default.parameters = { kind: "default", screenshot: true };

export const Themed = () => wrapWithTheme(<UiDropdownIconButtonTest />);
Themed.parameters = { kind: "themed", screenshot: true };

export const Interface = () => <UiDropdownIconButtonTest showCode />;
Interface.parameters = { kind: "interface" };
