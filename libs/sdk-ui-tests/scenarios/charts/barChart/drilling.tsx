// (C) 2007-2019 GoodData Corporation

import { scenariosFor } from "../../../src/index.js";
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";
import {
    BarChartWithSingleMeasureAndTwoViewByAndStack,
    BarChartWithSingleMeasureAndViewBy,
    BarChartWithTwoMeasuresAndTwoViewBy,
} from "./base.js";
import { measureLocalId } from "@gooddata/sdk-model";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { AttributeElements } from "../../_infra/predicates.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(ScenarioGroupNames.Drilling)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta", "mock-no-insight")
    .addScenario("single measure and viewBy with drilling on bars", {
        ...BarChartWithSingleMeasureAndViewBy,
        drillableItems: [AttributeElements.Product.Explorer, AttributeElements.Product.WonderKid],
    })
    .addScenario("single measure and two viewBy with drilling on parent attribute", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        drillableItems: [AttributeElements.Product.Explorer],
    })
    .addScenario("force disable drill on axes", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        drillableItems: [AttributeElements.Product.Explorer],
        config: {
            forceDisableDrillOnAxes: true,
        },
    })
    .addScenario("single measure and two viewBy with drilling on child attribute", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        drillableItems: [AttributeElements.Region.EastCoast],
    })
    .addScenario("two measures and two viewBy, dual axis, with drilling on child attribute", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        drillableItems: [AttributeElements.Region.EastCoast],
        config: {
            secondary_xaxis: {
                measures: [measureLocalId(ReferenceMd.Won)],
            },
        },
    })
    .addScenario("two measures and two viewBy, dual axis, with drilling on parent attribute", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        drillableItems: [AttributeElements.Product.Explorer],
        config: {
            secondary_xaxis: {
                measures: [measureLocalId(ReferenceMd.Won)],
            },
        },
    })
    .addScenario("two measures and two viewBy, dual axis, with drilling on parent and child attribute", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        drillableItems: [AttributeElements.Product.Explorer, AttributeElements.Region.EastCoast],
        config: {
            secondary_xaxis: {
                measures: [measureLocalId(ReferenceMd.Won)],
            },
        },
    })
    .addScenario(
        "single measure, two viewBy and stacking with drilling on parent",
        {
            ...BarChartWithSingleMeasureAndTwoViewByAndStack,
            drillableItems: [AttributeElements.Product.Explorer],
        },
        (m) => m.withTests("api"),
    ); // TODO: RAIL-2721 flaky test removed from screenshoting
