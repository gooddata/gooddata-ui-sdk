// (C) 2007-2019 GoodData Corporation
import { ColumnChart, IColumnChartProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";
import { BlackColor, CustomColorPalette, CustomPaletteColor, RedColor } from "../../_infra/colors";
import { AmountMeasurePredicate, AttributeElements, WonMeasurePredicate } from "../../_infra/predicates";
import { coloringCustomizer } from "../_infra/coloringVariants";
import {
    ColumnChartViewByDateAndPop,
    ColumnChartWithSingleMeasureViewByAndStackBy,
    ColumnChartWithTwoMeasuresAndViewBy,
} from "./base";

const colorsAndPalette = scenariosFor<IColumnChartProps>("ColumnChart", ColumnChart)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", ColumnChartWithTwoMeasuresAndViewBy, coloringCustomizer);

const colorAssignment = scenariosFor<IColumnChartProps>("ColumnChart", ColumnChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("assign color to measures", {
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
    })
    .addScenario("assign color to master measure impacts derived PoP", {
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
    })
    .addScenario("assign color to attribute element stack", {
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
    });

export default [colorsAndPalette, colorAssignment];
