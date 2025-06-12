// (C) 2007-2019 GoodData Corporation
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { BlackColor, CustomColorPalette, CustomPaletteColor, RedColor } from "../../_infra/colors.js";
import { AmountMeasurePredicate, AttributeElements, WonMeasurePredicate } from "../../_infra/predicates.js";
import { coloringCustomizer } from "../_infra/coloringVariants.js";
import {
    BarChartViewByDateAndPop,
    BarChartWithSingleMeasureViewByAndStackBy,
    BarChartWithTwoMeasuresAndViewBy,
} from "./base.js";
import { replaceMappingPredicates } from "../_infra/insightConverters.js";
import { measureLocalId } from "@gooddata/sdk-model";
import { ReferenceData, ReferenceMd } from "@gooddata/reference-workspace";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

const colorsAndPalette = scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", BarChartWithTwoMeasuresAndViewBy, coloringCustomizer);

const colorAssignment = scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario(
        "assign color to measures",
        {
            ...BarChartWithTwoMeasuresAndViewBy,
            config: {
                colorPalette: CustomColorPalette,
                colorMapping: [
                    {
                        predicate: AmountMeasurePredicate,
                        color: BlackColor,
                    },
                    {
                        predicate: WonMeasurePredicate,
                        color: CustomPaletteColor,
                    },
                ],
            },
        },
        (m) =>
            m.withInsightConverter(
                replaceMappingPredicates(measureLocalId(ReferenceMd.Amount), measureLocalId(ReferenceMd.Won)),
            ),
    )
    .addScenario(
        "assign color to master measure impacts derived PoP",
        {
            ...BarChartViewByDateAndPop,
            config: {
                colorPalette: CustomColorPalette,
                colorMapping: [
                    {
                        predicate: WonMeasurePredicate,
                        color: BlackColor,
                    },
                ],
            },
        },
        (m) => m.withInsightConverter(replaceMappingPredicates(measureLocalId(ReferenceMd.Won))),
    )
    .addScenario(
        "assign color to attribute element stack",
        {
            ...BarChartWithSingleMeasureViewByAndStackBy,
            config: {
                colorPalette: CustomColorPalette,
                colorMapping: [
                    {
                        predicate: AttributeElements.Region.EastCoast,
                        color: BlackColor,
                    },
                    {
                        predicate: AttributeElements.Region.WestCoast,
                        color: RedColor,
                    },
                ],
            },
        },
        (m) =>
            m.withInsightConverter(
                replaceMappingPredicates(
                    ReferenceData.Region.EastCoast.uri,
                    ReferenceData.Region.WestCoast.uri,
                ),
            ),
    );

export default [colorsAndPalette, colorAssignment];
