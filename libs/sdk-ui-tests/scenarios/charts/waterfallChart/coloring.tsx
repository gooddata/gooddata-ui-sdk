// (C) 2007-2025 GoodData Corporation
import { isColorDescriptor } from "@gooddata/sdk-model";
import { IMappingHeader } from "@gooddata/sdk-ui";
import { IWaterfallChartProps, WaterfallChart } from "@gooddata/sdk-ui-charts";

import { WaterfallChartWithMultiMeasures, WaterfallChartWithSingleMeasureAndViewBy } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { BlackColor, CustomColorPalette, CustomPaletteColor, RedColor } from "../../_infra/colors.js";
import { coloringCustomizer } from "../_infra/coloringVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

const TotalPredicate = (header: IMappingHeader) => {
    return isColorDescriptor(header) && header.colorHeaderItem.id.includes("total");
};
const PositivePredicate = (header: IMappingHeader) => {
    return isColorDescriptor(header) && header.colorHeaderItem.id.includes("positive");
};
const NegativePredicate = (header: IMappingHeader) => {
    return isColorDescriptor(header) && header.colorHeaderItem.id.includes("negative");
};

const colorsAndPalette = scenariosFor<IWaterfallChartProps>("WaterfallChart", WaterfallChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", WaterfallChartWithSingleMeasureAndViewBy, coloringCustomizer);

const colorAssignment = scenariosFor<IWaterfallChartProps>("WaterfallChart", WaterfallChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("assign color to measures", {
        ...WaterfallChartWithMultiMeasures,
        config: {
            colorPalette: CustomColorPalette,
            colorMapping: [
                {
                    predicate: TotalPredicate,
                    color: BlackColor,
                },
                {
                    predicate: NegativePredicate,
                    color: RedColor,
                },
                {
                    predicate: PositivePredicate,
                    color: CustomPaletteColor,
                },
            ],
            total: {
                enabled: true,
                name: "Total",
            },
        },
    });

export default [colorsAndPalette, colorAssignment];
