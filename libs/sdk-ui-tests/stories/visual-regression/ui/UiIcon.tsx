// (C) 2020-2025 GoodData Corporation
import { UiIcon, iconsConfig, UiIconProps, ComponentTable, propCombinationsFor } from "@gooddata/sdk-ui-kit";
import React from "react";

import { storiesOf } from "../../_infra/storyRepository.js";
import { UiStories } from "../../_infra/storyGroups.js";
import { wrapWithTheme } from "../themeWrapper.js";

const iconCombinations = propCombinationsFor({ label: "icon", size: 20 } as UiIconProps);
const types = Object.keys(iconsConfig) as Array<keyof typeof iconsConfig>;
const iconTypes = iconCombinations("type", types);
const iconSizes = iconCombinations("size", [12, 20]);
const iconColors = iconCombinations(
    "color",
    [
        "primary",
        "warning",
        "error",
        "complementary-9",
        "complementary-8",
        "complementary-7",
        "complementary-6",
        "complementary-5",
        "complementary-4",
        "complementary-3",
        "complementary-2",
        "complementary-1",
        "complementary-0",
    ],
    { type: "check" },
);
const iconHidden = iconCombinations("ariaHidden", [true, false]);
const iconSingleRow = iconCombinations("type", ["alert"]);

const UiIconTest: React.FC<{ showCode?: boolean }> = ({ showCode }) => (
    <div className="screenshot-target">
        <ComponentTable
            columnsBy={iconSizes}
            rowsBy={[iconTypes, iconColors]}
            Component={UiIcon}
            codeSnippet={showCode ? "UiIcon" : undefined}
            align="center"
            cellWidth={200}
        />

        <h1 className={"gd-typography gd-typography--h1"}>Accessibility</h1>
        <ComponentTable
            rowsBy={[iconSingleRow]}
            columnsBy={iconHidden}
            Component={UiIcon}
            codeSnippet={showCode ? "UiIcon" : undefined}
            align="center"
            cellWidth={200}
        />
    </div>
);

storiesOf(`${UiStories}/UiIcon`)
    .add("full-featured icon", () => <UiIconTest />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<UiIconTest />), { screenshot: true })
    .add("interface", () => <UiIconTest showCode />);
