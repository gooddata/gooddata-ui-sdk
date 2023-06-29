// (C) 2023 GoodData Corporation
import { ISankeyChartProps, SankeyChart } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { BlackColor, CustomColorPalette, RedColor } from "../../_infra/colors.js";
import { AttributeElements } from "../../_infra/predicates.js";
import { coloringCustomizer } from "../_infra/coloringVariants.js";
import { replaceMappingPredicates } from "../_infra/insightConverters.js";
import { ReferenceData } from "@gooddata/reference-workspace";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { SankeyChartWithMeasureAttributeFromAndTo } from "./base.js";

const colorsAndPalette = scenariosFor<ISankeyChartProps>("SankeyChart", SankeyChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", SankeyChartWithMeasureAttributeFromAndTo, coloringCustomizer);

const colorAssignment = scenariosFor<ISankeyChartProps>("SankeyChart", SankeyChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario(
        "assign color to nodes",
        {
            ...SankeyChartWithMeasureAttributeFromAndTo,
            config: {
                colorPalette: CustomColorPalette,
                colorMapping: [
                    {
                        predicate: AttributeElements.Product.WonderKid,
                        color: BlackColor,
                    },
                    {
                        predicate: AttributeElements.Product.Explorer,
                        color: RedColor,
                    },
                ],
            },
        },
        (m) =>
            m.withInsightConverter(
                replaceMappingPredicates(
                    ReferenceData.ProductName.WonderKid.uri,
                    ReferenceData.ProductName.Explorer.uri,
                ),
            ),
    );

export default [colorsAndPalette, colorAssignment];
