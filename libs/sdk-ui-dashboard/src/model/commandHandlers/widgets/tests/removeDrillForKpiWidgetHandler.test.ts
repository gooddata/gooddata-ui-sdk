// (C) 2021-2022 GoodData Corporation

import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures";
import { RemoveDrillsForInsightWidget, removeDrillForKpiWidget } from "../../../commands";
import { uriRef } from "@gooddata/sdk-model";
import { DashboardCommandFailed } from "../../../events";
import {
    KpiWidgetRef,
    SimpleDashboardIdentifier,
    SimpleSortedTableWidgetRef,
} from "../../../tests/fixtures/SimpleDashboard.fixtures";

describe("removeDrillForKpiWidgetHandler", () => {
    let Tester: DashboardTester;
    beforeEach(
        preloadedTesterFactory(async (tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier),
    );

    describe("remove", () => {
        it("should emit the appropriate events for remove drill for Kpi Widget command", async () => {
            await Tester.dispatchAndWaitFor(
                removeDrillForKpiWidget(KpiWidgetRef, TestCorrelation),
                "GDC.DASH/EVT.KPI_WIDGET.DRILL_REMOVED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });

    describe("validate", () => {
        it("should fail if trying to remove drills of non-existent widget", async () => {
            const event: DashboardCommandFailed<RemoveDrillsForInsightWidget> =
                await Tester.dispatchAndWaitFor(
                    removeDrillForKpiWidget(uriRef("missing"), TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.message).toMatchSnapshot();
            expect(event.payload.reason).toMatchSnapshot();
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to remove drills of insight widget", async () => {
            const event: DashboardCommandFailed<RemoveDrillsForInsightWidget> =
                await Tester.dispatchAndWaitFor(
                    removeDrillForKpiWidget(SimpleSortedTableWidgetRef, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.message).toMatchSnapshot();
            expect(event.payload.reason).toMatchSnapshot();
            expect(event.correlationId).toEqual(TestCorrelation);
        });
    });
});
