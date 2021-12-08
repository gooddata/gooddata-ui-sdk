// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../../src";
import { BulletChart, IBulletChartProps } from "@gooddata/sdk-ui-charts";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { BlackColor, CustomColorPalette, RedColor } from "../../_infra/colors";
import { replaceMappingPredicates } from "../_infra/insightConverters";
import { BulletChartWithAllMeasuresAndViewBy } from "./base";
import { HeaderPredicates } from "@gooddata/sdk-ui";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { ScenarioGroupNames } from "../_infra/groupNames";

const colorsAndPalette = scenariosFor<IBulletChartProps>("BulletChart", BulletChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", BulletChartWithAllMeasuresAndViewBy, coloringCustomizer);

const colorAssignment = scenariosFor<IBulletChartProps>("BulletChart", BulletChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario(
        "assign color to attribute bubbles",
        {
            ...BulletChartWithAllMeasuresAndViewBy,
            config: {
                colorPalette: CustomColorPalette,
                colorMapping: [
                    {
                        predicate: HeaderPredicates.localIdentifierMatch(ReferenceMd.Won),
                        color: BlackColor,
                    },
                    {
                        predicate: HeaderPredicates.localIdentifierMatch(ReferenceMd.Amount),
                        color: RedColor,
                    },
                ],
            },
        },
        (m) => m.withInsightConverter(replaceMappingPredicates(ReferenceMd.Won, ReferenceMd.Amount)),
    );

export default [colorsAndPalette, colorAssignment];
