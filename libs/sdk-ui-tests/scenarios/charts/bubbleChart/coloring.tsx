// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../../src";
import { BubbleChart, IBubbleChartProps } from "@gooddata/sdk-ui-charts";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { BlackColor, CustomColorPalette, RedColor } from "../../_infra/colors";
import { BubbleChartWithAllMeasuresAndAttribute } from "./base";
import { AttributeElements } from "../../_infra/predicates";
import { replaceMappingPredicates } from "../_infra/insightConverters";
import { ScenarioGroupNames } from "../_infra/groupNames";
import { ReferenceData } from "@gooddata/reference-workspace";

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
