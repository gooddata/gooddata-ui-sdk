// (C) 2025-2026 GoodData Corporation

import { ComponentTable, type IUiBadgeProps, UiBadge, propCombinationsFor } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

// eslint-disable-next-line no-restricted-exports
export default {
    title: "15 Ui/UiBadge",
};

const propCombination = propCombinationsFor({} as IUiBadgeProps);

const label = propCombination("label", ["badge"]);

function UiBadgeExample({ showCode }: { showCode?: boolean }) {
    return (
        <div className="screenshot-target">
            <ComponentTable
                rowsBy={[label]}
                Component={UiBadge}
                codeSnippet={showCode ? "UiBadge" : undefined}
            />
        </div>
    );
}

export function Default() {
    return <UiBadgeExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiBadgeExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interface() {
    return <UiBadgeExample showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
