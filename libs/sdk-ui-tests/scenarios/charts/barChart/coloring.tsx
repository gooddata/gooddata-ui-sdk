// (C) 2007-2019 GoodData Corporation
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";
import { BlackColor, CustomColorPalette, CustomPaletteColor, RedColor } from "../../_infra/colors";
import { AmountMeasurePredicate, AttributeElements, WonMeasurePredicate } from "../../_infra/predicates";
import { coloringCustomizer } from "../_infra/coloringVariants";
import {
    BarChartViewByDateAndPop,
    BarChartWithSingleMeasureViewByAndStackBy,
    BarChartWithTwoMeasuresAndViewBy,
} from "./base";

const colorsAndPalette = scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta", "mock-no-insight")
    .addScenarios("coloring", BarChartWithTwoMeasuresAndViewBy, coloringCustomizer);

const colorAssignment = scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta", "mock-no-insight")
    .addScenario("assign color to measures", {
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
    })
    .addScenario("assign color to master measure impacts derived PoP", {
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
    })
    .addScenario("assign color to attribute element stack", {
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
    });

export default [colorsAndPalette, colorAssignment];
