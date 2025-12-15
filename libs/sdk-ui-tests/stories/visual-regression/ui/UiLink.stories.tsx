// (C) 2020-2025 GoodData Corporation

import { ComponentTable, type IUiLinkProps, UiLink, propCombinationsFor } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const propCombination = propCombinationsFor({ children: "I am a link" } as IUiLinkProps);

const allVariants = propCombination("variant", ["primary", "secondary", "inverse"]);
const allFlipUnderlines = propCombination("flipUnderline", [false, true]);

function UiLinkTest({ showCode }: { showCode?: boolean }) {
    return (
        <div className="screenshot-target">
            <ComponentTable
                columnsBy={allVariants}
                rowsBy={[allFlipUnderlines]}
                Component={UiLink}
                codeSnippet={showCode ? "UiLink" : undefined}
                align="center"
                cellWidth={200}
                cellStyle={({ variant }) =>
                    variant === "inverse"
                        ? { backgroundColor: "var(--gd-palette-complementary-9)", padding: "10px 30px" }
                        : undefined
                }
            />
        </div>
    );
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "15 Ui/UiLink",
};

export function Default() {
    return <UiLinkTest />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: ".screenshot-target" },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiLinkTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: ".screenshot-target" },
} satisfies IStoryParameters;

export function Interface() {
    return <UiLinkTest showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
