// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../../src/index.js";
import { ComboChart, IComboChartProps } from "@gooddata/sdk-ui-charts";
import { ComboChartWithArithmeticMeasuresAndViewBy } from "./base.js";
import { coloringCustomizer } from "../_infra/coloringVariants.js";
import { BlackColor, CustomColorPalette, CustomPaletteColor } from "../../_infra/colors.js";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { AmountMeasurePredicate, WonMeasurePredicate } from "../../_infra/predicates.js";
import { replaceMappingPredicates } from "../_infra/insightConverters.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

const colorsAndPalette = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", ComboChartWithArithmeticMeasuresAndViewBy, coloringCustomizer);

const colorAssignment = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario(
        "assign color to measures",
        {
            ...ComboChartWithArithmeticMeasuresAndViewBy,
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
        (m) => m.withInsightConverter(replaceMappingPredicates(ReferenceMd.Amount, ReferenceMd.Won)),
    );

export default [colorsAndPalette, colorAssignment];
