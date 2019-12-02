// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../../src";
import { DonutChart, HeaderPredicateFactory, IDonutChartProps } from "@gooddata/sdk-ui";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { BlackColor, CustomColorPalette, RedColor, CustomPaletteColor } from "../../_infra/colors";
import { measureLocalId } from "@gooddata/sdk-model";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { DonutChartWithSingleMeasureAndViewBy, DonutChartWithTwoMeasures } from "./base";
import { AttributeElements } from "../../_infra/predicates";

const colorsAndPalette = scenariosFor<IDonutChartProps>("DonutChart", DonutChart)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("", DonutChartWithSingleMeasureAndViewBy, coloringCustomizer);

const colorAssignment = scenariosFor<IDonutChartProps>("DonutChart", DonutChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("assign color to measures", {
        ...DonutChartWithTwoMeasures,
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
    .addScenario("assign color to attributes", {
        ...DonutChartWithSingleMeasureAndViewBy,
        config: {
            colorPalette: CustomColorPalette,
            colorMapping: [
                {
                    predicate: AttributeElements.Product.WonderKid,
                    color: BlackColor,
                },
                {
                    predicate: AttributeElements.Product.Explorer,
                    color: RedColor,
                },
            ],
        },
    });

export default [colorsAndPalette, colorAssignment];
