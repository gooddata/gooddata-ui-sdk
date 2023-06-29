// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { ChangeKpiWidgetHeader, changeKpiWidgetHeader } from "../../../commands/index.js";
import { DashboardCommandFailed, DashboardKpiWidgetHeaderChanged } from "../../../events/index.js";
import { selectAnalyticalWidgetByRef } from "../../../store/layout/layoutSelectors.js";
import { idRef, uriRef } from "@gooddata/sdk-model";
import {
    ComplexDashboardIdentifier,
    ComplexDashboardWidgets,
} from "../../../tests/fixtures/ComplexDashboard.fixtures.js";

describe("change KPI widget header handler", () => {
    describe("for dashboard with KPIs and insights", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, ComplexDashboardIdentifier);
        });

        const TestHeader = { title: "new title" };

        it("should update title for KPI widget", async () => {
            const ref = ComplexDashboardWidgets.FirstSection.FirstKpi.ref;

            const event: DashboardKpiWidgetHeaderChanged = await Tester.dispatchAndWaitFor(
                changeKpiWidgetHeader(ref, TestHeader),
                "GDC.DASH/EVT.KPI_WIDGET.HEADER_CHANGED",
            );

            expect(event.payload.header).toEqual(TestHeader);
            const widgetState = selectAnalyticalWidgetByRef(ref)(Tester.state());
            expect(widgetState!.title).toEqual(TestHeader.title);
        });

        it("should update title for KPI widget referenced by id", async () => {
            const identifier = ComplexDashboardWidgets.FirstSection.FirstKpi.identifier;
            const ref = idRef(identifier);
            const event: DashboardKpiWidgetHeaderChanged = await Tester.dispatchAndWaitFor(
                changeKpiWidgetHeader(ref, TestHeader),
                "GDC.DASH/EVT.KPI_WIDGET.HEADER_CHANGED",
            );

            expect(event.payload.header).toEqual(TestHeader);
            const widgetState = selectAnalyticalWidgetByRef(ref)(Tester.state());
            expect(widgetState!.title).toEqual(TestHeader.title);
        });

        it("should update title for KPI widget referenced by uri", async () => {
            const uri = ComplexDashboardWidgets.FirstSection.FirstKpi.uri;
            const ref = uriRef(uri);
            const event: DashboardKpiWidgetHeaderChanged = await Tester.dispatchAndWaitFor(
                changeKpiWidgetHeader(ref, TestHeader),
                "GDC.DASH/EVT.KPI_WIDGET.HEADER_CHANGED",
            );

            expect(event.payload.header).toEqual(TestHeader);
            const widgetState = selectAnalyticalWidgetByRef(ref)(Tester.state());
            expect(widgetState!.title).toEqual(TestHeader.title);
        });

        it("should fail if trying to change title of insight widget", async () => {
            const ref = ComplexDashboardWidgets.SecondSection.FirstTable.ref;
            const event: DashboardCommandFailed<ChangeKpiWidgetHeader> = await Tester.dispatchAndWaitFor(
                changeKpiWidgetHeader(ref, TestHeader, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to change title of non-existent widget", async () => {
            const event: DashboardCommandFailed<ChangeKpiWidgetHeader> = await Tester.dispatchAndWaitFor(
                changeKpiWidgetHeader(uriRef("missing"), TestHeader, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should emit correct events", async () => {
            const ref = ComplexDashboardWidgets.FirstSection.FirstKpi.ref;

            await Tester.dispatchAndWaitFor(
                changeKpiWidgetHeader(ref, TestHeader, TestCorrelation),
                "GDC.DASH/EVT.KPI_WIDGET.HEADER_CHANGED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });
});
