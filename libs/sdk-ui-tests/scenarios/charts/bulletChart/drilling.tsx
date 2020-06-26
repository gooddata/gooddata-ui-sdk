// (C) 2007-2019 GoodData Corporation

import { scenariosFor } from "../../../src";
import { BulletChart, IBulletChartProps } from "@gooddata/sdk-ui-charts";
import { AttributeElements } from "../../_infra/predicates";
import { BulletChartWithAllMeasuresAndTwoViewBy, BulletChartWithAllMeasuresAndViewBy } from "./base";
import { ScenarioGroupNames } from "../_infra/groupNames";

export default scenariosFor<IBulletChartProps>("BulletChart", BulletChart)
    .withGroupNames(ScenarioGroupNames.Drilling)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta", "mock-no-insight")
    .addScenario("drilling with single view by drilling", {
        ...BulletChartWithAllMeasuresAndViewBy,
        drillableItems: [AttributeElements.Product.Explorer, AttributeElements.Product.WonderKid],
    })
    .addScenario("single measure and two viewBy with drilling on parent attribute", {
        ...BulletChartWithAllMeasuresAndTwoViewBy,
        drillableItems: [AttributeElements.Product.Explorer],
    })
    .addScenario("single measure and two viewBy with drilling on child attribute", {
        ...BulletChartWithAllMeasuresAndTwoViewBy,
        drillableItems: [AttributeElements.Region.EastCoast],
    });
