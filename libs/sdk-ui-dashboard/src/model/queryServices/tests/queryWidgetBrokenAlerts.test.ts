// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../tests/DashboardTester.js";
import { queryWidgetBrokenAlerts } from "../../queries/index.js";
import { idRef, ObjRef } from "@gooddata/sdk-model";
import {
    AttributeFilterSelectionChangedRef,
    BrokenFilterAlertsDashboardIdentifier,
    CorrectAlertActiveRef,
    CorrectAlertActiveOffRef,
    IgnoredFilterRef,
    NoAlertRef,
    RemovedFiltersKpiIdentifier,
    RemovedFiltersKpiRef,
    TestCorrelation,
} from "../../tests/fixtures/BrokenFilterAlerts.fixtures.js";
import { IBrokenAlertFilterBasicInfo } from "../../types/alertTypes.js";

describe("query widget broken alerts filters", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, BrokenFilterAlertsDashboardIdentifier);
    });

    it("should fail in case the widget does not exist", async () => {
        const expectedError = {
            correlationId: TestCorrelation,
            payload: {
                reason: "USER_ERROR",
            },
        };
        await expect(
            Tester.query(queryWidgetBrokenAlerts(idRef("non existent widget"), TestCorrelation)),
        ).rejects.toMatchObject(expectedError);
    });

    it.each<[string, ObjRef]>([
        ["kpi where some filters removed from dashboard", RemovedFiltersKpiRef],
        [
            "kpi referenced by Identifier where some filters removed from dashboard",
            idRef(RemovedFiltersKpiIdentifier),
        ],
        ["kpi where widget ignore some filters from dashboard", IgnoredFilterRef],
        ["kpi where default filer selection changed", AttributeFilterSelectionChangedRef],
        ["kpi has no alerts", NoAlertRef],
        ["kpi has correct alert active", CorrectAlertActiveRef],
        ["kpi has correct alert off", CorrectAlertActiveOffRef],
    ])("should return broken filter alerts %s", async (_, ref) => {
        const result: IBrokenAlertFilterBasicInfo[] = await Tester.query(
            queryWidgetBrokenAlerts(ref, TestCorrelation),
        );
        expect(result).toMatchSnapshot();
    });
});
