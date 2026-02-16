// (C) 2007-2026 GoodData Corporation

import { ReferenceData } from "@gooddata/reference-workspace";
import { BubbleChart, type IBubbleChartProps } from "@gooddata/sdk-ui-charts";

import { BubbleChartWithAllMeasuresAndAttribute } from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { BlackColor, CustomColorPalette, RedColor } from "../../_infra/colors.js";
import { AttributeElements } from "../../_infra/predicates.js";
import { coloringCustomizer } from "../_infra/coloringVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { replaceMappingPredicates } from "../_infra/insightConverters.js";

const colorsAndPalette = scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withVisualTestConfig({
        groupUnder: "coloring",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", BubbleChartWithAllMeasuresAndAttribute, coloringCustomizer);

const colorAssignment = scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario(
        "assign color to attribute bubbles",
        {
            ...BubbleChartWithAllMeasuresAndAttribute,
            config: {
                colorPalette: CustomColorPalette,
                colorMapping: [
                    {
                        predicate: AttributeElements.Product.Explorer,
                        color: BlackColor,
                    },
                    {
                        predicate: AttributeElements.Product.WonderKid,
                        color: RedColor,
                    },
                ],
            },
        },
        (m) =>
            m.withInsightConverter(
                replaceMappingPredicates(
                    ReferenceData.ProductName.Explorer.uri,
                    ReferenceData.ProductName.WonderKid.uri,
                ),
            ),
    );

export const coloring = [colorsAndPalette, colorAssignment];
