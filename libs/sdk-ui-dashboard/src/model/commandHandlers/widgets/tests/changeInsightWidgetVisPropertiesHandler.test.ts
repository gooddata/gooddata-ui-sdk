// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import {
    ChangeInsightWidgetVisProperties,
    changeInsightWidgetVisProperties,
} from "../../../commands/index.js";
import { DashboardCommandFailed, DashboardInsightWidgetVisPropertiesChanged } from "../../../events/index.js";
import { selectAnalyticalWidgetByRef } from "../../../store/layout/layoutSelectors.js";
import { idRef, uriRef, IInsightWidget } from "@gooddata/sdk-model";
import {
    ComplexDashboardIdentifier,
    ComplexDashboardWidgets,
} from "../../../tests/fixtures/ComplexDashboard.fixtures.js";

describe("change insight widget vis properties handler", () => {
    describe("for dashboard with KPIs and insights", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, ComplexDashboardIdentifier);
        });

        const TestProperties = { controls: { legend: false } };

        it("should set new properties", async () => {
            const ref = ComplexDashboardWidgets.SecondSection.FirstTable.ref;

            const event: DashboardInsightWidgetVisPropertiesChanged = await Tester.dispatchAndWaitFor(
                changeInsightWidgetVisProperties(ref, TestProperties),
                "GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED",
            );

            expect(event.payload.properties).toEqual(TestProperties);
            const widgetState = selectAnalyticalWidgetByRef(ref)(Tester.state()) as IInsightWidget;
            expect(widgetState!.properties).toEqual(TestProperties);
        });

        it("should set new properties for insight widget referenced by id", async () => {
            const identifier = ComplexDashboardWidgets.SecondSection.FirstTable.identifier;
            const ref = idRef(identifier);
            const event: DashboardInsightWidgetVisPropertiesChanged = await Tester.dispatchAndWaitFor(
                changeInsightWidgetVisProperties(ref, TestProperties),
                "GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED",
            );

            expect(event.payload.properties).toEqual(TestProperties);
            const widgetState = selectAnalyticalWidgetByRef(ref)(Tester.state()) as IInsightWidget;
            expect(widgetState!.properties).toEqual(TestProperties);
        });

        it("should set new properties for insight widget referenced by uri", async () => {
            const uri = ComplexDashboardWidgets.SecondSection.FirstTable.uri;
            const ref = uriRef(uri);
            const event: DashboardInsightWidgetVisPropertiesChanged = await Tester.dispatchAndWaitFor(
                changeInsightWidgetVisProperties(ref, TestProperties),
                "GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED",
            );

            expect(event.payload.properties).toEqual(TestProperties);
            const widgetState = selectAnalyticalWidgetByRef(ref)(Tester.state()) as IInsightWidget;
            expect(widgetState!.properties).toEqual(TestProperties);
        });

        it("should clear properties if undefined", async () => {
            const ref = ComplexDashboardWidgets.SecondSection.FirstTable.ref;

            const event: DashboardInsightWidgetVisPropertiesChanged = await Tester.dispatchAndWaitFor(
                changeInsightWidgetVisProperties(ref, undefined),
                "GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED",
            );

            expect(event.payload.properties).toBeUndefined();
            const widgetState = selectAnalyticalWidgetByRef(ref)(Tester.state()) as IInsightWidget;
            expect(widgetState!.properties).toBeUndefined();
        });

        it("should clear properties if empty properties", async () => {
            const ref = ComplexDashboardWidgets.SecondSection.FirstTable.ref;

            const event: DashboardInsightWidgetVisPropertiesChanged = await Tester.dispatchAndWaitFor(
                changeInsightWidgetVisProperties(ref, {}),
                "GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED",
            );

            expect(event.payload.properties).toEqual({});
            const widgetState = selectAnalyticalWidgetByRef(ref)(Tester.state()) as IInsightWidget;
            expect(widgetState!.properties).toBeUndefined();
        });

        it("should fail if trying to change properties of KPI widget", async () => {
            const ref = ComplexDashboardWidgets.FirstSection.FirstKpi.ref;
            const event: DashboardCommandFailed<ChangeInsightWidgetVisProperties> =
                await Tester.dispatchAndWaitFor(
                    changeInsightWidgetVisProperties(ref, TestProperties, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to vis properties of non-existent widget", async () => {
            const event: DashboardCommandFailed<ChangeInsightWidgetVisProperties> =
                await Tester.dispatchAndWaitFor(
                    changeInsightWidgetVisProperties(uriRef("missing"), TestProperties, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should emit correct events", async () => {
            const ref = ComplexDashboardWidgets.SecondSection.FirstTable.ref;

            await Tester.dispatchAndWaitFor(
                changeInsightWidgetVisProperties(ref, TestProperties, TestCorrelation),
                "GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });
});
