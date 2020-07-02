// (C) 2007-2019 GoodData Corporation
import { ColumnChart, IColumnChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { BlackColor, CustomColorPalette, CustomPaletteColor, RedColor } from "../../_infra/colors";
import { AmountMeasurePredicate, AttributeElements, WonMeasurePredicate } from "../../_infra/predicates";
import { coloringCustomizer } from "../_infra/coloringVariants";
import {
    ColumnChartViewByDateAndPop,
    ColumnChartWithSingleMeasureViewByAndStackBy,
    ColumnChartWithTwoMeasuresAndViewBy,
} from "./base";
import { replaceMappingPredicates } from "../_infra/insightConverters";
import { measureLocalId } from "@gooddata/sdk-model";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { Region } from "../../_infra/data";
import { ScenarioGroupNames } from "../_infra/groupNames";

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
                replaceMappingPredicates(
                    measureLocalId(ReferenceLdm.Amount),
                    measureLocalId(ReferenceLdm.Won),
                ),
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
        (m) => m.withInsightConverter(replaceMappingPredicates(measureLocalId(ReferenceLdm.Won))),
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
        (m) => m.withInsightConverter(replaceMappingPredicates(Region.EastCoast, Region.WestCoast)),
    );

export default [colorsAndPalette, colorAssignment];
