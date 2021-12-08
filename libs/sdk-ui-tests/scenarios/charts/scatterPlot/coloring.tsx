// (C) 2007-2019 GoodData Corporation
import { IScatterPlotProps, ScatterPlot } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { BlackColor, CustomColorPalette } from "../../_infra/colors";
import { AmountMeasurePredicate } from "../../_infra/predicates";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { ScatterPlotWithMeasuresAndAttribute } from "./base";
import { replaceMappingPredicates } from "../_infra/insightConverters";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { ScenarioGroupNames } from "../_infra/groupNames";

const colorsAndPalette = scenariosFor<IScatterPlotProps>("ScatterPlot", ScatterPlot)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", ScatterPlotWithMeasuresAndAttribute, coloringCustomizer);

const colorAssignment = scenariosFor<IScatterPlotProps>("ScatterPlot", ScatterPlot)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario(
        "assign color to measures",
        {
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
        },
        (m) => m.withInsightConverter(replaceMappingPredicates(ReferenceMd.Amount)),
    );

export default [colorsAndPalette, colorAssignment];
