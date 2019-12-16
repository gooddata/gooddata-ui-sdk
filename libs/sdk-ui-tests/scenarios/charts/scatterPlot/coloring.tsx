// (C) 2007-2019 GoodData Corporation
import { IScatterPlotProps, ScatterPlot } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";
import { BlackColor, CustomColorPalette } from "../../_infra/colors";
import { AmountMeasurePredicate } from "../../_infra/predicates";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { ScatterPlotWithMeasuresAndAttribute } from "./base";

const colorsAndPalette = scenariosFor<IScatterPlotProps>("ScatterPlot", ScatterPlot)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("", ScatterPlotWithMeasuresAndAttribute, coloringCustomizer);

const colorAssignment = scenariosFor<IScatterPlotProps>("ScatterPlot", ScatterPlot)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("assign color to measures", {
        ...ScatterPlotWithMeasuresAndAttribute,
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
