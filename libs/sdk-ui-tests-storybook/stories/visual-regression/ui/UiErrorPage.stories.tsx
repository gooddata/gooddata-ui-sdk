// (C) 2026 GoodData Corporation

import {
    ComponentTable,
    type IUiErrorPageProps,
    UiErrorPage,
    propCombinationsFor,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

export default {
    title: "15 Ui/UiErrorPage",
};

const description = "It may have been deleted or you don't have access.";

const propCombination = propCombinationsFor({ description } as IUiErrorPageProps);

const allTitles = propCombination("title", [
    "We can't find this dashboard",
    "We can't find this visualization",
    "We can't find this metric",
    "We can't find this item",
]);

const titleOnly = propCombination("description", [undefined], {
    title: "Title only",
});

function UiErrorPageExamples({ showCode }: { showCode?: boolean }) {
    return (
        <div className="screenshot-target">
            <ComponentTable
                rowsBy={[allTitles, titleOnly]}
                Component={UiErrorPage}
                codeSnippet={showCode ? "UiErrorPage" : undefined}
                cellWidth={420}
                cellHeight={200}
            />
        </div>
    );
}

export function Default() {
    return <UiErrorPageExamples />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Themed() {
    return wrapWithTheme(<UiErrorPageExamples />);
}
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interface() {
    return <UiErrorPageExamples showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
