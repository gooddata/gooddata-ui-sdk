// (C) 2020-2025 GoodData Corporation

import { ComponentTable, UiIconButton, UiIconButtonProps, propCombinationsFor } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../themeWrapper.js";

const propCombination = propCombinationsFor({
    label: "Icon Button Label",
    icon: "check",
} as UiIconButtonProps);

const sizes = propCombination("size", ["small", "medium", "large"]);
const variants = propCombination("variant", ["primary", "secondary", "tertiary", "popout", "danger"]);
const disabled = propCombination("isDisabled", [true]);

function UiIconButtonTest({ showCode }: { showCode?: boolean }) {
    return (
        <div className="screenshot-target">
            <ComponentTable
                columnsBy={variants}
                rowsBy={[sizes, disabled]}
                Component={UiIconButton}
                codeSnippet={showCode ? "UiIconButton" : undefined}
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
Default.parameters = { kind: "default", screenshot: true };

export const Themed = () => wrapWithTheme(<UiIconButtonTest />);
Themed.parameters = { kind: "themed", screenshot: true };

export function Interface() {
    return <UiIconButtonTest showCode />;
}
Interface.parameters = { kind: "interface" };
