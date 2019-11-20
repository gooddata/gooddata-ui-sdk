// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../../src";
import { ColumnChart, HeaderPredicateFactory, IColumnChartProps } from "@gooddata/sdk-ui";
import {
    ColumnChartViewByDateAndPop,
    ColumnChartWithSingleMeasureViewByAndStackBy,
    ColumnChartWithTwoMeasuresAndViewBy,
} from "./base";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { BlackColor, CustomColorPalette, CustomPaletteColor, RedColor } from "../_infra/colors";
import { measureLocalId } from "@gooddata/sdk-model";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { AttributeElements } from "../_infra/predicates";

const colorsAndPalette = scenariosFor<IColumnChartProps>("ColumnChart", ColumnChart)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("", ColumnChartWithTwoMeasuresAndViewBy, coloringCustomizer);

const colorAssignment = scenariosFor<IColumnChartProps>("ColumnChart", ColumnChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("assign color to measures", {
        ...ColumnChartWithTwoMeasuresAndViewBy,
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
        ...ColumnChartViewByDateAndPop,
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
        ...ColumnChartWithSingleMeasureViewByAndStackBy,
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
