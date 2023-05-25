// (C) 2007-2019 GoodData Corporation
import { ColumnChart, IColumnChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { BlackColor, CustomColorPalette, CustomPaletteColor, RedColor } from "../../_infra/colors.js";
import { AmountMeasurePredicate, AttributeElements, WonMeasurePredicate } from "../../_infra/predicates.js";
import { coloringCustomizer } from "../_infra/coloringVariants.js";
import {
    ColumnChartViewByDateAndPop,
    ColumnChartWithSingleMeasureViewByAndStackBy,
    ColumnChartWithTwoMeasuresAndViewBy,
} from "./base.js";
import { replaceMappingPredicates } from "../_infra/insightConverters.js";
import { measureLocalId } from "@gooddata/sdk-model";
import { ReferenceData, ReferenceMd } from "@gooddata/reference-workspace";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

const colorsAndPalette = scenariosFor<IColumnChartProps>("ColumnChart", ColumnChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", ColumnChartWithTwoMeasuresAndViewBy, coloringCustomizer);

const colorAssignment = scenariosFor<IColumnChartProps>("ColumnChart", ColumnChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario(
        "assign color to measures",
        {
            ...ColumnChartWithTwoMeasuresAndViewBy,
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
            ...ColumnChartViewByDateAndPop,
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
            ...ColumnChartWithSingleMeasureViewByAndStackBy,
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
