// (C) 2020-2025 GoodData Corporation

import {
    ComponentTable,
    UiIcon,
    type UiIconProps,
    iconPaths,
    propCombinationsFor,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const iconCombinations = propCombinationsFor({ label: "icon", size: 20 } as UiIconProps);
const iconWithBackgroundCombinations = propCombinationsFor({
    label: "icon with background",
    size: 14,
    backgroundSize: 27,
    color: "complementary-9",
    type: "check",
} as UiIconProps);
const types = Object.keys(iconPaths) as Array<keyof typeof iconPaths>;
const iconSizes = iconCombinations("size", [12, 20]);
const iconColors = iconCombinations(
    "color",
    [
        "primary",
        "warning",
        "error",
        "currentColor",
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

const backgroundColors = iconWithBackgroundCombinations("backgroundColor", [
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
]);
const backgroundShapesTypeFill = iconWithBackgroundCombinations("backgroundShape", ["circle", "square"], {
    backgroundType: "fill",
});
const backgroundShapesTypeBorder = iconWithBackgroundCombinations("backgroundShape", ["circle", "square"], {
    backgroundType: "border",
});

function UiIconTest({ showCode, iconGallery = false }: { showCode?: boolean; iconGallery?: boolean }) {
    return (
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
                        {iconGallery ? (
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
                        ) : null}
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
                    <h1 className={"gd-typography gd-typography--h1"}>Background</h1>
                    <ComponentTable
                        columnsBy={backgroundColors}
                        rowsBy={[backgroundShapesTypeFill, backgroundShapesTypeBorder]}
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
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "15 Ui/UiIcon",
};

export function IconGallery() {
    return <UiIconTest iconGallery />;
}
IconGallery.parameters = { kind: "icon gallery" } satisfies IStoryParameters;

export function FullFeaturedIcon() {
    return <UiIconTest />;
}
FullFeaturedIcon.parameters = {
    kind: "full-featured icon",
    screenshot: { readySelector: ".screenshot-target" },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiIconTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: ".screenshot-target" },
} satisfies IStoryParameters;

export function Interface() {
    return <UiIconTest showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
