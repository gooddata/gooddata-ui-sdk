// (C) 2007-2019 GoodData Corporation
import { IPieChartProps, PieChart } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";
import { BlackColor, CustomColorPalette, CustomPaletteColor, RedColor } from "../../_infra/colors";
import { AmountMeasurePredicate, AttributeElements, WonMeasurePredicate } from "../../_infra/predicates";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { PieChartWithSingleMeasureAndViewBy, PieChartWithTwoMeasures } from "./base";

const colorsAndPalette = scenariosFor<IPieChartProps>("PieChart", PieChart)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("", PieChartWithSingleMeasureAndViewBy, coloringCustomizer);

const colorAssignment = scenariosFor<IPieChartProps>("PieChart", PieChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("assign color to measures", {
        ...PieChartWithTwoMeasures,
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
    .addScenario("assign color to attributes", {
        ...PieChartWithSingleMeasureAndViewBy,
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
    });

export default [colorsAndPalette, colorAssignment];
