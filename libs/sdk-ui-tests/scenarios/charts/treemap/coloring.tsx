// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../../src";
import { ITreemapProps, Treemap } from "@gooddata/sdk-ui-charts";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { BlackColor, CustomColorPalette, RedColor } from "../../_infra/colors";
import { TreemapWithMeasureViewByAndSegmentBy } from "./base";
import { AttributeElements } from "../../_infra/predicates";
import { replaceMappingPredicates } from "../_infra/insightConverters";
import { ScenarioGroupNames } from "../_infra/groupNames";
import { ReferenceData } from "@gooddata/reference-workspace";

const colorsAndPalette = scenariosFor<ITreemapProps>("Treemap", Treemap)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", TreemapWithMeasureViewByAndSegmentBy, coloringCustomizer);

const colorAssignment = scenariosFor<ITreemapProps>("Treemap", Treemap)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario(
        "assign color to attributes",
        {
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
        },
        (m) =>
            m.withInsightConverter(
                replaceMappingPredicates(
                    ReferenceData.ProductName.WonderKid.uri,
                    ReferenceData.ProductName.Explorer.uri,
                ),
            ),
    );

export default [colorsAndPalette, colorAssignment];
