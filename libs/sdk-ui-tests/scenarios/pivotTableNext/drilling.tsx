// (C) 2025 GoodData Corporation
import { action } from "storybook/actions";
import { scenariosFor } from "../../src/index.js";
import { IPivotTableNextProps, PivotTableNext } from "@gooddata/sdk-ui-pivot/next";
import { PivotTableWithTwoMeasuresAndThreeRowsAndTwoCols } from "./base.js";
import {
    DepartmentPredicate,
    ProductPredicate,
    SalesRepPredicate,
    AmountMeasurePredicate,
    WonMeasurePredicate,
} from "../_infra/predicates.js";

export default scenariosFor<IPivotTableNextProps>("PivotTableNext", PivotTableNext)
    .withGroupNames("drilling")
    .withVisualTestConfig({ screenshotSize: { width: 1200, height: 800 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("with drill on all row atributes", {
        ...PivotTableWithTwoMeasuresAndThreeRowsAndTwoCols,
        drillableItems: [ProductPredicate, DepartmentPredicate, SalesRepPredicate],
        onDrill: action("onDrill"),
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
        onDrill: action("onDrill"),
    });
