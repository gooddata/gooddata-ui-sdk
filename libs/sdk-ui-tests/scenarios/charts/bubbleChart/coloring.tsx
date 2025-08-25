// (C) 2007-2025 GoodData Corporation
import { ReferenceData } from "@gooddata/reference-workspace";
import { BubbleChart, IBubbleChartProps } from "@gooddata/sdk-ui-charts";

import { BubbleChartWithAllMeasuresAndAttribute } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { BlackColor, CustomColorPalette, RedColor } from "../../_infra/colors.js";
import { AttributeElements } from "../../_infra/predicates.js";
import { coloringCustomizer } from "../_infra/coloringVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { replaceMappingPredicates } from "../_infra/insightConverters.js";

const colorsAndPalette = scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", BubbleChartWithAllMeasuresAndAttribute, coloringCustomizer);

const colorAssignment = scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
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

export default [colorsAndPalette, colorAssignment];
