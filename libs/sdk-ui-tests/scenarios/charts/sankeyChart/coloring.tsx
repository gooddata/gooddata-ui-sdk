// (C) 2007-2019 GoodData Corporation
import { ISankeyChartProps, SankeyChart } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { BlackColor, CustomColorPalette, RedColor } from "../../_infra/colors";
import { AttributeElements } from "../../_infra/predicates";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { replaceMappingPredicates } from "../_infra/insightConverters";
import { ReferenceData } from "@gooddata/reference-workspace";
import { ScenarioGroupNames } from "../_infra/groupNames";
import { SankeyChartWithMeasureAttributeFromAndTo } from "./base";

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
