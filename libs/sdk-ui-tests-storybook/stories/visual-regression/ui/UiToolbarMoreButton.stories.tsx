// (C) 2026 GoodData Corporation

import {
    ComponentTable,
    type IUiToolbarMoreButtonProps,
    UiToolbarMoreButton,
    propCombinationsFor,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

import { MoreMenu, ToolbarStoryFrame } from "./_helpers/toolbarStories.js";

const propCombination = propCombinationsFor({ label: "More actions" } as IUiToolbarMoreButtonProps);

const icons = propCombination("icon", [undefined, "ellipsisVertical"]);
const open = propCombination("isOpen", [true]);
const disabled = propCombination("isDisabled", [true]);

function UiToolbarMoreButtonTest({ showCode }: { showCode?: boolean }) {
    return (
        <ToolbarStoryFrame>
            <ComponentTable
                columnsBy={icons}
                rowsBy={[propCombination("isOpen", [false]), open, disabled]}
                Component={UiToolbarMoreButton}
                codeSnippet={showCode ? "UiToolbarMoreButton" : undefined}
                align="center"
                cellWidth={200}
            />
        </ToolbarStoryFrame>
    );
}

export default {
    title: "15 Ui/UiToolbarMoreButton",
};

export function Default() {
    return <UiToolbarMoreButtonTest />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function WithMenu() {
    return (
        <ToolbarStoryFrame style={{ minHeight: 220 }}>
            <MoreMenu openOnInit />
        </ToolbarStoryFrame>
    );
}
WithMenu.parameters = {
    kind: "with-menu",
    screenshot: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        postInteractionWait: { selector: '[role="menu"]', delay: 200 },
    },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiToolbarMoreButtonTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interface() {
    return <UiToolbarMoreButtonTest showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
