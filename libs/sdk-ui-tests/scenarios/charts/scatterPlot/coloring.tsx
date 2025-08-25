// (C) 2007-2025 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { IScatterPlotProps, ScatterPlot } from "@gooddata/sdk-ui-charts";

import { ScatterPlotWithMeasuresAndAttribute, ScatterPlotWithMeasuresAttributeAndSegmentBy } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { BlackColor, CustomColorPalette } from "../../_infra/colors.js";
import { AmountMeasurePredicate } from "../../_infra/predicates.js";
import { coloringCustomizer } from "../_infra/coloringVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { replaceMappingPredicates } from "../_infra/insightConverters.js";

const colorsAndPalette = scenariosFor<IScatterPlotProps>("ScatterPlot", ScatterPlot)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", ScatterPlotWithMeasuresAndAttribute, coloringCustomizer)
    .addScenarios(
        "coloring with segmentation",
        ScatterPlotWithMeasuresAttributeAndSegmentBy,
        coloringCustomizer,
    );

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
