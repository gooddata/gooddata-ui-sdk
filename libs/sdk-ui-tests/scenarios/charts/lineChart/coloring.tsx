// (C) 2007-2019 GoodData Corporation
import { ILineChartProps, LineChart } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";
import { BlackColor, CustomColorPalette } from "../../_infra/colors";
import { AmountMeasurePredicate } from "../../_infra/predicates";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { LineChartTwoMeasuresWithTrendyBy } from "./base";
import { replaceMappingPredicates } from "../_infra/insightConverters";
import { ReferenceLdm } from "@gooddata/reference-workspace";

const colorsAndPalette = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", LineChartTwoMeasuresWithTrendyBy, coloringCustomizer);

const colorAssignment = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario(
        "assign color to measures",
        {
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
        },
        m => m.withInsightConverter(replaceMappingPredicates(ReferenceLdm.Amount)),
    );

export default [colorsAndPalette, colorAssignment];
