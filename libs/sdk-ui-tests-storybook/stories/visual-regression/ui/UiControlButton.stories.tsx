// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import {
    ComponentTable,
    type IUiControlButtonProps,
    UiControlButton,
    UiIcon,
    propCombinationsFor,
} from "@gooddata/sdk-ui-kit";
import "@gooddata/sdk-ui-kit/styles/css/main.css";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const parameterIcon: ReactNode = <UiIcon type="parameter" size={16} color="currentColor" />;

const propCombination = propCombinationsFor({
    title: "Threshold",
    subtitle: "= 25",
} as IUiControlButtonProps);

const allOpen = propCombination("isOpen", [false, true]);
const allDraggable = propCombination("isDraggable", [false, true]);
const allError = propCombination("isError", [false, true]);
const allDisabled = propCombination("disabled", [false, true]);
const withIcon = propCombination("icon", [undefined, parameterIcon]);
const withSubtitle = propCombination("subtitle", ["= 25", undefined]);
const withTitleExtension = propCombination("titleExtension", [
    undefined,
    <span key="ext" style={{ marginLeft: 4 }}>
        ★
    </span>,
]);

function UiControlButtonTest({ showCode }: { showCode?: boolean }) {
    return (
        <div className="screenshot-target" style={{ padding: 20 }}>
            <ComponentTable
                columnsBy={allOpen}
                rowsBy={[allDraggable, allError, allDisabled, withIcon, withSubtitle, withTitleExtension]}
                Component={UiControlButton}
                codeSnippet={showCode ? "UiControlButton" : undefined}
                align="center"
                cellWidth={260}
            />
        </div>
    );
}

export default {
    title: "15 Ui/UiControlButton",
};

export function FullFeatured() {
    return <UiControlButtonTest />;
}
FullFeatured.parameters = {
    kind: "full-featured chip button",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiControlButtonTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interface() {
    return <UiControlButtonTest showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
