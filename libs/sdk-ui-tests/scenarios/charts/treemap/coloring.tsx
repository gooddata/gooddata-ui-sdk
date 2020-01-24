// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../../src";
import { ITreemapProps, Treemap } from "@gooddata/sdk-ui";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { BlackColor, CustomColorPalette, RedColor } from "../../_infra/colors";
import { TreemapWithMeasureViewByAndSegmentBy } from "./base";
import { AttributeElements } from "../../_infra/predicates";

const colorsAndPalette = scenariosFor<ITreemapProps>("Treemap", Treemap)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", TreemapWithMeasureViewByAndSegmentBy, coloringCustomizer);

const colorAssignment = scenariosFor<ITreemapProps>("Treemap", Treemap)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("assign color to attributes", {
        ...TreemapWithMeasureViewByAndSegmentBy,
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
