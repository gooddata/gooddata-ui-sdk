// (C) 2026 GoodData Corporation

import {
    ComponentTable,
    type IUiToolbarColorSwatchProps,
    UiToolbarColorSwatch,
    propCombinationsFor,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

import { ToolbarStoryFrame } from "./_helpers/toolbarStories.js";

const propCombination = propCombinationsFor({ color: "#14b2e2" } as IUiToolbarColorSwatchProps);

const variants = propCombination("variant", ["fill", "text"]);
const colors = propCombination("color", ["#e54d42", "#ffffff", "#fcedec", undefined]);
const bordered = propCombination("hasBorder", [true], { color: "#ffffff" });
const transparent = propCombination("isTransparent", [true]);
const transparentBordered = propCombination("isTransparent", [true], { hasBorder: true });

function UiToolbarColorSwatchTest({ showCode }: { showCode?: boolean }) {
    return (
        <ToolbarStoryFrame>
            <ComponentTable
                columnsBy={variants}
                rowsBy={[colors, bordered, transparent, transparentBordered]}
                Component={UiToolbarColorSwatch}
                codeSnippet={showCode ? "UiToolbarColorSwatch" : undefined}
                align="center"
                cellWidth={120}
            />
        </ToolbarStoryFrame>
    );
}

export default {
    title: "15 Ui/UiToolbarColorSwatch",
};

export function Default() {
    return <UiToolbarColorSwatchTest />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiToolbarColorSwatchTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interface() {
    return <UiToolbarColorSwatchTest showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
