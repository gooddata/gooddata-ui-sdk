// (C) 2023-2026 GoodData Corporation

import { ReferenceData } from "@gooddata/reference-workspace";
import { type ISankeyChartProps, SankeyChart } from "@gooddata/sdk-ui-charts";

import { SankeyChartWithMeasureAttributeFromAndTo } from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { BlackColor, CustomColorPalette, RedColor } from "../../_infra/colors.js";
import { AttributeElements } from "../../_infra/predicates.js";
import { coloringCustomizer } from "../_infra/coloringVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { replaceMappingPredicates } from "../_infra/insightConverters.js";

const colorsAndPalette = scenariosFor<ISankeyChartProps>("SankeyChart", SankeyChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withVisualTestConfig({
        groupUnder: "coloring",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", SankeyChartWithMeasureAttributeFromAndTo, coloringCustomizer);

const colorAssignment = scenariosFor<ISankeyChartProps>("SankeyChart", SankeyChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
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

export const coloring = [colorsAndPalette, colorAssignment];
