// (C) 2025 GoodData Corporation

import { ComponentTable, UiBadge, UiBadgeProps, propCombinationsFor } from "@gooddata/sdk-ui-kit";

import { IStoryParameters } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

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
Default.parameters = { kind: "default", screenshot: true } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiBadgeExample />);
Themed.parameters = { kind: "themed", screenshot: true } satisfies IStoryParameters;

export function Interface() {
    return <UiBadgeExample showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
