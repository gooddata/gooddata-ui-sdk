// (C) 2026 GoodData Corporation

import {
    ComponentTable,
    type IUiToolbarPaginationProps,
    UiToolbarPagination,
    propCombinationsFor,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

import { FocusOnMount, ToolbarStoryFrame } from "./_helpers/toolbarStories.js";

const PAGE_A11Y = { ariaLabel: "Page", previousLabel: "Previous page", nextLabel: "Next page" };

const pagination = propCombinationsFor({
    currentPage: 3,
    totalPages: 12,
    onPageChange: () => {},
    accessibilityConfig: PAGE_A11Y,
} as IUiToolbarPaginationProps);

function UiToolbarPaginationTest({ showCode }: { showCode?: boolean }) {
    return (
        <ToolbarStoryFrame>
            <ComponentTable
                columnsBy={pagination("isValueEditable", [false, true])}
                rowsBy={[pagination("currentPage", [1, 3, 12]), pagination("isDisabled", [true])]}
                Component={UiToolbarPagination}
                codeSnippet={showCode ? "UiToolbarPagination" : undefined}
                align="center"
                cellWidth={200}
            />
        </ToolbarStoryFrame>
    );
}

export default {
    title: "15 Ui/UiToolbarPagination",
};

export function Default() {
    return <UiToolbarPaginationTest />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interactions() {
    return (
        <ToolbarStoryFrame style={{ gridTemplateColumns: "repeat(2, max-content)" }}>
            <UiToolbarPagination
                currentPage={3}
                totalPages={12}
                onPageChange={() => {}}
                isValueEditable
                accessibilityConfig={PAGE_A11Y}
                dataTestId="s-hover"
            />
            <FocusOnMount selector='[data-testid="s-focus"] input'>
                <UiToolbarPagination
                    currentPage={3}
                    totalPages={12}
                    onPageChange={() => {}}
                    isValueEditable
                    accessibilityConfig={PAGE_A11Y}
                    dataTestId="s-focus"
                />
            </FocusOnMount>
        </ToolbarStoryFrame>
    );
}
Interactions.parameters = {
    kind: "interactions",
    screenshots: {
        "page-focused": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            postInteractionWait: { selector: '[data-testid="s-focus"] input:focus' },
        },
        "page-hovered": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            hoverSelector: '[data-testid="s-hover"] input',
            postInteractionWait: { delay: 400 },
        },
    },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiToolbarPaginationTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interface() {
    return <UiToolbarPaginationTest showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
