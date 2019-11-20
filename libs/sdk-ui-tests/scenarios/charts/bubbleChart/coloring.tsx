// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../../src";
import { BubbleChart, IBubbleChartProps } from "@gooddata/sdk-ui";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { BlackColor, CustomColorPalette, RedColor } from "../_infra/colors";
import { BubbleChartWithAllMeasuresAndAttribute } from "./base";
import { AttributeElements } from "../_infra/predicates";

const colorsAndPalette = scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("", BubbleChartWithAllMeasuresAndAttribute, coloringCustomizer);

const colorAssignment = scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("assign color to attribute bubbles", {
        ...BubbleChartWithAllMeasuresAndAttribute,
        config: {
            colorPalette: CustomColorPalette,
            colorMapping: [
                {
                    predicate: AttributeElements.Product.Explorer,
                    color: BlackColor,
                },
                {
                    predicate: AttributeElements.Product.WonderKid,
                    color: RedColor,
                },
            ],
        },
    });

export default [colorsAndPalette, colorAssignment];
