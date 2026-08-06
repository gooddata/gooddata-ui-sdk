// (C) 2025-2026 GoodData Corporation

import { type IPivotTableNextProps, PivotTableNext } from "@gooddata/sdk-ui-pivot/next";

import { scenarioAction } from "../../scenarioAction.js";
import { scenariosFor } from "../../scenarioGroup.js";
import {
    AmountMeasurePredicate,
    DepartmentPredicate,
    ProductPredicate,
    SalesRepPredicate,
    WonMeasurePredicate,
} from "../_infra/predicates.js";

import { PivotTableWithTwoMeasuresAndThreeRowsAndTwoCols } from "./base.js";

export const drilling = scenariosFor<IPivotTableNextProps>("PivotTableNext", PivotTableNext)
    .withGroupNames("drilling")
    .withVisualTestConfig({
        screenshotSize: { width: 1200, height: 800 },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("with drill on all row atributes", {
        ...PivotTableWithTwoMeasuresAndThreeRowsAndTwoCols,
        drillableItems: [ProductPredicate, DepartmentPredicate, SalesRepPredicate],
        onDrill: scenarioAction("onDrill"),
    })
    .addScenario("with drill on all row attributes and measures", {
        ...PivotTableWithTwoMeasuresAndThreeRowsAndTwoCols,
        drillableItems: [
            ProductPredicate,
            DepartmentPredicate,
            SalesRepPredicate,
            AmountMeasurePredicate,
            WonMeasurePredicate,
        ],
        onDrill: scenarioAction("onDrill"),
    });
