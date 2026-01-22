// (C) 2021-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { idRef, uriRef } from "@gooddata/sdk-model";

import { type IChangeInsightWidgetHeader, changeInsightWidgetHeader } from "../../../commands/insight.js";
import { type IDashboardCommandFailed } from "../../../events/general.js";
import { type IDashboardInsightWidgetHeaderChanged } from "../../../events/insight.js";
import { selectAnalyticalWidgetByRef } from "../../../store/tabs/layout/layoutSelectors.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import {
    ComplexDashboardIdentifier,
    ComplexDashboardWidgets,
} from "../../../tests/fixtures/ComplexDashboard.fixtures.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";

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

            const event: IDashboardInsightWidgetHeaderChanged = await Tester.dispatchAndWaitFor(
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
            const event: IDashboardInsightWidgetHeaderChanged = await Tester.dispatchAndWaitFor(
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
            const event: IDashboardInsightWidgetHeaderChanged = await Tester.dispatchAndWaitFor(
                changeInsightWidgetHeader(ref, TestHeader),
                "GDC.DASH/EVT.INSIGHT_WIDGET.HEADER_CHANGED",
            );

            expect(event.payload.header).toEqual(TestHeader);
            const widgetState = selectAnalyticalWidgetByRef(ref)(Tester.state());
            expect(widgetState!.title).toEqual(TestHeader.title);
        });

        it("should fail if trying to change title of non-existent widget", async () => {
            const event: IDashboardCommandFailed<IChangeInsightWidgetHeader> =
                await Tester.dispatchAndWaitFor(
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
