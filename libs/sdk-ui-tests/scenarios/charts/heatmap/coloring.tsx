// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../../src";
import { HeaderPredicateFactory, Heatmap, IHeatmapProps } from "@gooddata/sdk-ui";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { BlackColor, CustomColorPalette } from "../_infra/colors";
import { measureLocalId } from "@gooddata/sdk-model";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { HeatmapWithMeasureRowsAndColumns } from "./base";

const colorsAndPalette = scenariosFor<IHeatmapProps>("Heatmap", Heatmap)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("", HeatmapWithMeasureRowsAndColumns, coloringCustomizer);

const colorAssignment = scenariosFor<IHeatmapProps>("Heatmap", Heatmap)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("assign color to measures", {
        ...HeatmapWithMeasureRowsAndColumns,
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
