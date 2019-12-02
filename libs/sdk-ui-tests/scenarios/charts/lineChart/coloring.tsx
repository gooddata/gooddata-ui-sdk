// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../../src";
import { HeaderPredicateFactory, LineChart, ILineChartProps } from "@gooddata/sdk-ui";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { BlackColor, CustomColorPalette } from "../../_infra/colors";
import { measureLocalId } from "@gooddata/sdk-model";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { LineChartTwoMeasuresWithTrendyBy } from "./base";

const colorsAndPalette = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("", LineChartTwoMeasuresWithTrendyBy, coloringCustomizer);

const colorAssignment = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("assign color to measures", {
        ...LineChartTwoMeasuresWithTrendyBy,
        config: {
            colorPalette: CustomColorPalette,
            colorMapping: [
                {
                    predicate: HeaderPredicateFactory.localIdentifierMatch(
                        measureLocalId(ReferenceLdm.Amount),
                    ),
                    color: BlackColor,
                },
            ],
        },
    });

export default [colorsAndPalette, colorAssignment];
