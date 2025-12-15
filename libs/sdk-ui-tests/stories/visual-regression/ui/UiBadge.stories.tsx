// (C) 2025 GoodData Corporation

import { ComponentTable, UiBadge, type UiBadgeProps, propCombinationsFor } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

// eslint-disable-next-line no-restricted-exports
export default {
    title: "15 Ui/UiBadge",
};

const propCombination = propCombinationsFor({} as UiBadgeProps);

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
    screenshot: { readySelector: ".screenshot-target" },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiBadgeExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: ".screenshot-target" },
} satisfies IStoryParameters;

export function Interface() {
    return <UiBadgeExample showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
