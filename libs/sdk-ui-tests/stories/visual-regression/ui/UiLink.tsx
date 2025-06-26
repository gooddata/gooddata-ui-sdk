// (C) 2020-2025 GoodData Corporation
import { ComponentTable, propCombinationsFor, IUiLinkProps, UiLink } from "@gooddata/sdk-ui-kit";
import React from "react";

import { storiesOf } from "../../_infra/storyRepository.js";
import { UiStories } from "../../_infra/storyGroups.js";
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

storiesOf(`${UiStories}/UiLink`)
    .add("default", () => <UiLinkTest />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<UiLinkTest />), { screenshot: true })
    .add("interface", () => <UiLinkTest showCode />);
