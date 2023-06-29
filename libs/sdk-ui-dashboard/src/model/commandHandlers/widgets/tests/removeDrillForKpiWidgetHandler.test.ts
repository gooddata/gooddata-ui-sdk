// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { RemoveDrillsForInsightWidget, removeDrillForKpiWidget } from "../../../commands/index.js";
import { uriRef } from "@gooddata/sdk-model";
import { DashboardCommandFailed } from "../../../events/index.js";
import {
    KpiWidgetRef,
    SimpleDashboardIdentifier,
    SimpleSortedTableWidgetRef,
} from "../../../tests/fixtures/SimpleDashboard.fixtures.js";

describe("removeDrillForKpiWidgetHandler", () => {
    let Tester: DashboardTester;
    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

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
