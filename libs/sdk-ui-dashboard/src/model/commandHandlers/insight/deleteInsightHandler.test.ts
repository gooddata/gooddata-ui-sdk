// (C) 2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";

import { idRef, insightId } from "@gooddata/sdk-model";

import { TestCorrelation } from "../../../tests/Dashboard.test.helpers.js";
import {
    SimpleDashboardIdentifier,
    SimpleSortedTableWidgetInsightRef,
} from "../../../tests/SimpleDashboard.test.helpers.js";
import { type IDeleteInsight, deleteInsight } from "../../commands/insightDelete.js";
import { addSectionItem } from "../../commands/layout.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { type IDashboardCommandFailed } from "../../events/general.js";
import { type IDashboardInsightDeleted } from "../../events/insightDelete.js";
import { selectInsightByRef } from "../../store/insights/insightsSelectors.js";
import { selectInsightListLastUpdateRequested } from "../../store/ui/uiSelectors.js";
import {
    PivotTableWithDateFilter,
    PivotTableWithRowAndColumnAttributes,
} from "../../tests/Insights.test.helpers.js";
import { TestInsightItem } from "../../tests/Layout.test.helpers.js";

describe("delete insight handler", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory(
            (tester) => {
                Tester = tester;
            },
            SimpleDashboardIdentifier,
            {
                backendConfig: {
                    useRefType: "id",
                },
            },
        );
    });

    it("should refuse to delete an insight the saved dashboard uses", async () => {
        const event: IDashboardCommandFailed<IDeleteInsight> = await Tester.dispatchAndWaitFor(
            deleteInsight(SimpleSortedTableWidgetInsightRef, TestCorrelation),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
        expect(event.correlationId).toEqual(TestCorrelation);
        expect(selectInsightByRef(SimpleSortedTableWidgetInsightRef)(Tester.state())).toBeDefined();
    });

    it("should delete an insight that is not on the dashboard", async () => {
        const ref = idRef(insightId(PivotTableWithDateFilter), "insight");
        const listUpdateBefore = selectInsightListLastUpdateRequested(Tester.state());

        const event: IDashboardInsightDeleted = await Tester.dispatchAndWaitFor(
            deleteInsight(ref, TestCorrelation),
            "GDC.DASH/EVT.INSIGHT.DELETED",
        );

        expect(event.payload.ref).toEqual(ref);
        expect(event.correlationId).toEqual(TestCorrelation);
        expect(selectInsightListLastUpdateRequested(Tester.state())).not.toEqual(listUpdateBefore);
    });

    it("should refuse to delete an insight an unsaved widget uses", async () => {
        const insightRef = idRef(insightId(PivotTableWithRowAndColumnAttributes), "insight");
        await Tester.dispatchAndWaitFor(
            addSectionItem(0, 0, TestInsightItem, false, TestCorrelation),
            "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
        );

        const event: IDashboardCommandFailed<IDeleteInsight> = await Tester.dispatchAndWaitFor(
            deleteInsight(insightRef, TestCorrelation),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
        expect(selectInsightByRef(insightRef)(Tester.state())).toBeDefined();
    });
});
