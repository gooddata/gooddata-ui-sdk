// (C) 2020-2025 GoodData Corporation
import { ComponentTable, iconPaths, propCombinationsFor, UiIcon, UiIconProps } from "@gooddata/sdk-ui-kit";
import React from "react";

import { UiStories } from "../../_infra/storyGroups.js";
import { storiesOf } from "../../_infra/storyRepository.js";
import { wrapWithTheme } from "../themeWrapper.js";

const iconCombinations = propCombinationsFor({ label: "icon", size: 20 } as UiIconProps);
const types = Object.keys(iconPaths) as Array<keyof typeof iconPaths>;
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

const UiIconTest: React.FC<{ showCode?: boolean; iconGallery?: boolean }> = ({
    showCode,
    iconGallery = false,
}) => (
    <div className="screenshot-target">
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: "20px",
                padding: "20px",
            }}
        >
            {types.map((iconType, index) => (
                <div
                    key={index}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "15px",
                        border: "1px solid var(--gd-palette-complementary-2)",
                        borderRadius: "4px",
                        backgroundColor: "var(--gd-palette-complementary-0)",
                    }}
                >
                    <UiIcon type={iconType} />
                    {iconGallery && (
                        <span
                            style={{
                                marginTop: "8px",
                                fontSize: "12px",
                                color: "var(--gd-palette-complementary-7)",
                                textAlign: "center",
                            }}
                        >
                            {iconType}
                        </span>
                    )}
                </div>
            ))}
        </div>
        {!iconGallery && (
            <>
                <ComponentTable
                    columnsBy={iconSizes}
                    rowsBy={[iconColors]}
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
            </>
        )}
    </div>
);

storiesOf(`${UiStories}/UiIcon`)
    .add("icon gallery", () => <UiIconTest iconGallery />)
    .add("full-featured icon", () => <UiIconTest />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<UiIconTest />), { screenshot: true })
    .add("interface", () => <UiIconTest showCode />);
