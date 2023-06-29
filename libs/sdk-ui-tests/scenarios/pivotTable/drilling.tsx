// (C) 2007-2019 GoodData Corporation
import { action } from "@storybook/addon-actions";
import { scenariosFor } from "../../src/index.js";
import { IPivotTableProps, PivotTable } from "@gooddata/sdk-ui-pivot";
import { PivotTableWithTwoMeasuresAndThreeRowsAndTwoCols } from "./base.js";
import {
    DepartmentPredicate,
    ProductPredicate,
    SalesRepPredicate,
    AmountMeasurePredicate,
    WonMeasurePredicate,
} from "../_infra/predicates.js";

export default scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
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
