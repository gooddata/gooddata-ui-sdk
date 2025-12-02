// (C) 2025 GoodData Corporation

import {
    ComponentTable,
    UiDropdownIconButton,
    UiDropdownIconButtonProps,
    propCombinationsFor,
} from "@gooddata/sdk-ui-kit";

import { IStoryParameters } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const propCombination = propCombinationsFor({
    icon: "directionRow",
} as UiDropdownIconButtonProps);

const variants = propCombination("variant", ["primary", "secondary", "tertiary"]);
const sizes = propCombination("size", ["small", "medium", "large"]);
const disabled = propCombination("isDisabled", [true]);
const open = propCombination("isDropdownOpen", [true]);

function UiDropdownIconButtonTest({ showCode }: { showCode?: boolean }) {
    return (
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
}

export default {
    title: "15 Ui/UiDropdownIconButton",
};

export function Default() {
    return <UiDropdownIconButtonTest />;
}
Default.parameters = { kind: "default", screenshot: true } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiDropdownIconButtonTest />);
Themed.parameters = { kind: "themed", screenshot: true } satisfies IStoryParameters;

export function Interface() {
    return <UiDropdownIconButtonTest showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
