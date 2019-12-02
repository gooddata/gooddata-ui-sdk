// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../../src";
import { HeaderPredicateFactory, IScatterPlotProps, ScatterPlot } from "@gooddata/sdk-ui";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { BlackColor, CustomColorPalette } from "../../_infra/colors";
import { measureLocalId } from "@gooddata/sdk-model";
import { ReferenceLdm } from "@gooddata/reference-workspace";
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
                    predicate: HeaderPredicateFactory.localIdentifierMatch(
                        measureLocalId(ReferenceLdm.Amount),
                    ),
                    color: BlackColor,
                },
            ],
        },
    });

export default [colorsAndPalette, colorAssignment];
