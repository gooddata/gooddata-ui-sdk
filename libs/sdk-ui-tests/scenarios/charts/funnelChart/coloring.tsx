// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../../src";
import { FunnelChart, HeaderPredicateFactory, IFunnelChartProps } from "@gooddata/sdk-ui";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { BlackColor, CustomColorPalette, RedColor, CustomPaletteColor } from "../../_infra/colors";
import { measureLocalId } from "@gooddata/sdk-model";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { AttributeElements } from "../../_infra/predicates";
import { FunnelChartWithMeasureAndViewBy, FunnelChartWithArithmeticMeasures } from "./base";

const colorsAndPalette = scenariosFor<IFunnelChartProps>("FunnelChart", FunnelChart)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("", FunnelChartWithMeasureAndViewBy, coloringCustomizer);

const colorAssignment = scenariosFor<IFunnelChartProps>("FunnelChart", FunnelChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("assign color to measures", {
        ...FunnelChartWithArithmeticMeasures,
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
        ...FunnelChartWithMeasureAndViewBy,
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
