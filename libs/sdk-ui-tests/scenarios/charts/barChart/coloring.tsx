// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../../src";
import { BarChart, HeaderPredicateFactory, IBarChartProps } from "@gooddata/sdk-ui";
import {
    BarChartViewByDateAndPop,
    BarChartWithSingleMeasureViewByAndStackBy,
    BarChartWithTwoMeasuresAndViewBy,
} from "./base";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { BlackColor, CustomColorPalette, RedColor, CustomPaletteColor } from "../_infra/colors";
import { measureLocalId } from "@gooddata/sdk-model";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { AttributeElements } from "../_infra/predicates";

const colorsAndPalette = scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("", BarChartWithTwoMeasuresAndViewBy, coloringCustomizer);

const colorAssignment = scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("assign color to measures", {
        ...BarChartWithTwoMeasuresAndViewBy,
        config: {
            colorPalette: CustomColorPalette,
            colorMapping: [
                {
                    predicate: HeaderPredicateFactory.localIdentifierMatch(
                        measureLocalId(ReferenceLdm.Amount),
                    ),
                    color: BlackColor,
                },
                {
                    predicate: HeaderPredicateFactory.localIdentifierMatch(measureLocalId(ReferenceLdm.Won)),
                    color: CustomPaletteColor,
                },
            ],
        },
    })
    .addScenario("assign color to master measure impacts derived PoP", {
        ...BarChartViewByDateAndPop,
        config: {
            colorPalette: CustomColorPalette,
            colorMapping: [
                {
                    predicate: HeaderPredicateFactory.localIdentifierMatch(measureLocalId(ReferenceLdm.Won)),
                    color: BlackColor,
                },
            ],
        },
    })
    .addScenario("assign color to attribute element stack", {
        ...BarChartWithSingleMeasureViewByAndStackBy,
        config: {
            colorPalette: CustomColorPalette,
            colorMapping: [
                {
                    predicate: AttributeElements.Region.EastCoast,
                    color: BlackColor,
                },
                {
                    predicate: AttributeElements.Region.WestCoast,
                    color: RedColor,
                },
            ],
        },
    });

export default [colorsAndPalette, colorAssignment];
