// (C) 2020-2025 GoodData Corporation
import { ComponentTable, propCombinationsFor, IUiLinkProps, UiLink } from "@gooddata/sdk-ui-kit";
import React from "react";

import { wrapWithTheme } from "../themeWrapper.js";

const propCombination = propCombinationsFor({ children: "I am a link" } as IUiLinkProps);

const allVariants = propCombination("variant", ["primary", "secondary", "inverse"]);
const allFlipUnderlines = propCombination("flipUnderline", [false, true]);

const UiLinkTest: React.FC<{ showCode?: boolean }> = ({ showCode }) => (
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

export default {
    title: "15 Ui/UiLink",
};

export const Default = () => <UiLinkTest />;
Default.parameters = { kind: "default", screenshot: true };

export const Themed = () => wrapWithTheme(<UiLinkTest />);
Themed.parameters = { kind: "themed", screenshot: true };

export const Interface = () => <UiLinkTest showCode />;
Interface.parameters = { kind: "interface" };
