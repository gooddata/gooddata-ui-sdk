// (C) 2007-2019 GoodData Corporation

import { scenariosFor } from "../../../src/index.js";
import { ColumnChart, IColumnChartProps } from "@gooddata/sdk-ui-charts";
import {
    ColumnChartWithSingleMeasureAndTwoViewByAndStack,
    ColumnChartWithSingleMeasureAndViewBy,
    ColumnChartWithTwoMeasuresAndTwoViewBy,
} from "./base.js";
import { measureLocalId } from "@gooddata/sdk-model";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { AttributeElements } from "../../_infra/predicates.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IColumnChartProps>("ColumnChart", ColumnChart)
    .withGroupNames(ScenarioGroupNames.Drilling)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta", "mock-no-insight")
    .addScenario("single measure and viewBy with drilling on bars", {
        ...ColumnChartWithSingleMeasureAndViewBy,
        drillableItems: [AttributeElements.Product.Explorer, AttributeElements.Product.WonderKid],
    })
    .addScenario("single measure and two viewBy with drilling on parent attribute", {
        ...ColumnChartWithTwoMeasuresAndTwoViewBy,
        drillableItems: [AttributeElements.Product.Explorer],
    })
    .addScenario("force disable drill on axes", {
        ...ColumnChartWithTwoMeasuresAndTwoViewBy,
        drillableItems: [AttributeElements.Product.Explorer],
        config: {
            forceDisableDrillOnAxes: true,
        },
    })
    .addScenario("single measure and two viewBy with drilling on child attribute", {
        ...ColumnChartWithTwoMeasuresAndTwoViewBy,
        drillableItems: [AttributeElements.Region.EastCoast],
    })
    .addScenario("two measures and two viewBy, dual axis, with drilling on child attribute", {
        ...ColumnChartWithTwoMeasuresAndTwoViewBy,
        drillableItems: [AttributeElements.Region.EastCoast],
        config: {
            secondary_yaxis: {
                measures: [measureLocalId(ReferenceMd.Won)],
            },
        },
    })
    .addScenario("two measures and two viewBy, dual axis, with drilling on parent attribute", {
        ...ColumnChartWithTwoMeasuresAndTwoViewBy,
        drillableItems: [AttributeElements.Product.Explorer],
        config: {
            secondary_yaxis: {
                measures: [measureLocalId(ReferenceMd.Won)],
            },
        },
    })
    .addScenario("two measures and two viewBy, dual axis, with drilling on parent and child attribute", {
        ...ColumnChartWithTwoMeasuresAndTwoViewBy,
        drillableItems: [AttributeElements.Product.Explorer, AttributeElements.Region.EastCoast],
        config: {
            secondary_yaxis: {
                measures: [measureLocalId(ReferenceMd.Won)],
            },
        },
    })
    .addScenario("single measure, two viewBy and stacking with drilling on parent", {
        ...ColumnChartWithSingleMeasureAndTwoViewByAndStack,
        drillableItems: [AttributeElements.Product.Explorer],
    })
    .addScenario("single measure, two viewBy and stacking with drilling on child", {
        ...ColumnChartWithSingleMeasureAndTwoViewByAndStack,
        drillableItems: [AttributeElements.Region.EastCoast],
    });
