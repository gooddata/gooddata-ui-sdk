// (C) 2025 GoodData Corporation

import {
    ComponentTable,
    UiPaginationButton,
    UiPaginationButtonProps,
    propCombinationsFor,
} from "@gooddata/sdk-ui-kit";

import { IStoryParameters } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

// eslint-disable-next-line no-restricted-exports
export default {
    title: "15 Ui/UiPaginationButton",
};

const propCombination = propCombinationsFor({
    label: "Pagination Button",
} as UiPaginationButtonProps);

const directions = propCombination("direction", ["previous", "next"]);
const sizes = propCombination("size", ["large", "small"]);
const active = propCombination("isActive", [true]);
const disabled = propCombination("isDisabled", [true]);

function UiPaginationButtonExample({ showCode }: { showCode?: boolean }) {
    return (
        <div className="screenshot-target">
            <ComponentTable
                columnsBy={directions}
                rowsBy={[sizes, active, disabled]}
                Component={UiPaginationButton}
                codeSnippet={showCode ? "UiPaginationButton" : undefined}
                align="center"
                cellWidth={150}
            />
        </div>
    );
}

export function Default() {
    return <UiPaginationButtonExample />;
}
Default.parameters = { kind: "default", screenshot: true } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiPaginationButtonExample />);
Themed.parameters = { kind: "themed", screenshot: true } satisfies IStoryParameters;

export function Interface() {
    return <UiPaginationButtonExample showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
