// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { ChangeInsightWidgetHeader, changeInsightWidgetHeader } from "../../../commands/index.js";
import { DashboardCommandFailed, DashboardInsightWidgetHeaderChanged } from "../../../events/index.js";
import { selectAnalyticalWidgetByRef } from "../../../store/layout/layoutSelectors.js";
import { idRef, uriRef } from "@gooddata/sdk-model";
import {
    ComplexDashboardIdentifier,
    ComplexDashboardWidgets,
} from "../../../tests/fixtures/ComplexDashboard.fixtures.js";

describe("change insight widget header handler", () => {
    describe("for dashboard with KPIs and insights", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, ComplexDashboardIdentifier);
        });

        const TestHeader = { title: "new title" };

        it("should update title for insight widget", async () => {
            const ref = ComplexDashboardWidgets.SecondSection.FirstTable.ref;

            const event: DashboardInsightWidgetHeaderChanged = await Tester.dispatchAndWaitFor(
                changeInsightWidgetHeader(ref, TestHeader),
                "GDC.DASH/EVT.INSIGHT_WIDGET.HEADER_CHANGED",
            );

            expect(event.payload.header).toEqual(TestHeader);
            const widgetState = selectAnalyticalWidgetByRef(ref)(Tester.state());
            expect(widgetState!.title).toEqual(TestHeader.title);
        });

        it("should update title for insight widget referenced by id", async () => {
            const identifier = ComplexDashboardWidgets.SecondSection.FirstTable.identifier;
            const ref = idRef(identifier);
            const event: DashboardInsightWidgetHeaderChanged = await Tester.dispatchAndWaitFor(
                changeInsightWidgetHeader(ref, TestHeader),
                "GDC.DASH/EVT.INSIGHT_WIDGET.HEADER_CHANGED",
            );

            expect(event.payload.header).toEqual(TestHeader);
            const widgetState = selectAnalyticalWidgetByRef(ref)(Tester.state());
            expect(widgetState!.title).toEqual(TestHeader.title);
        });

        it("should update title for insight widget referenced by uri", async () => {
            const uri = ComplexDashboardWidgets.SecondSection.FirstTable.uri;
            const ref = uriRef(uri);
            const event: DashboardInsightWidgetHeaderChanged = await Tester.dispatchAndWaitFor(
                changeInsightWidgetHeader(ref, TestHeader),
                "GDC.DASH/EVT.INSIGHT_WIDGET.HEADER_CHANGED",
            );

            expect(event.payload.header).toEqual(TestHeader);
            const widgetState = selectAnalyticalWidgetByRef(ref)(Tester.state());
            expect(widgetState!.title).toEqual(TestHeader.title);
        });

        it("should fail if trying to change title of KPI widget", async () => {
            const ref = ComplexDashboardWidgets.FirstSection.FirstKpi.ref;
            const event: DashboardCommandFailed<ChangeInsightWidgetHeader> = await Tester.dispatchAndWaitFor(
                changeInsightWidgetHeader(ref, TestHeader, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to change title of non-existent widget", async () => {
            const event: DashboardCommandFailed<ChangeInsightWidgetHeader> = await Tester.dispatchAndWaitFor(
                changeInsightWidgetHeader(uriRef("missing"), TestHeader, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should emit correct events", async () => {
            const ref = ComplexDashboardWidgets.SecondSection.FirstTable.ref;

            await Tester.dispatchAndWaitFor(
                changeInsightWidgetHeader(ref, TestHeader, TestCorrelation),
                "GDC.DASH/EVT.INSIGHT_WIDGET.HEADER_CHANGED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });
});
