// (C) 2007-2019 GoodData Corporation
import { ILineChartProps, LineChart } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";
import { BlackColor, CustomColorPalette } from "../../_infra/colors";
import { AmountMeasurePredicate } from "../../_infra/predicates";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { LineChartTwoMeasuresWithTrendyBy } from "./base";

const colorsAndPalette = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta", "mock-no-insight")
    .addScenarios("coloring", LineChartTwoMeasuresWithTrendyBy, coloringCustomizer);

const colorAssignment = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta", "mock-no-insight")
    .addScenario("assign color to measures", {
        ...LineChartTwoMeasuresWithTrendyBy,
        config: {
            colorPalette: CustomColorPalette,
            colorMapping: [
                {
                    predicate: AmountMeasurePredicate,
                    color: BlackColor,
                },
            ],
        },
    });

export default [colorsAndPalette, colorAssignment];
