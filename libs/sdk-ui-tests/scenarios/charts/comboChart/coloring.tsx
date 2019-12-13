// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../../src";
import { ComboChart, HeaderPredicates, IComboChartProps } from "@gooddata/sdk-ui";
import { ComboChartWithArithmeticMeasuresAndViewBy } from "./base";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { BlackColor, CustomColorPalette, CustomPaletteColor } from "../../_infra/colors";
import { measureLocalId } from "@gooddata/sdk-model";
import { ReferenceLdm } from "@gooddata/reference-workspace";

const colorsAndPalette = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("", ComboChartWithArithmeticMeasuresAndViewBy, coloringCustomizer);

const colorAssignment = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("assign color to measures", {
        ...ComboChartWithArithmeticMeasuresAndViewBy,
        config: {
            colorPalette: CustomColorPalette,
            colorMapping: [
                {
                    predicate: HeaderPredicates.localIdentifierMatch(measureLocalId(ReferenceLdm.Amount)),
                    color: BlackColor,
                },
                {
                    predicate: HeaderPredicates.localIdentifierMatch(measureLocalId(ReferenceLdm.Won)),
                    color: CustomPaletteColor,
                },
            ],
        },
    });

export default [colorsAndPalette, colorAssignment];
