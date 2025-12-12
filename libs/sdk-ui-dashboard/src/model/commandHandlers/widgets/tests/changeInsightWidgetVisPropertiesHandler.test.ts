// (C) 2021-2025 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { type IInsightWidget, idRef, uriRef } from "@gooddata/sdk-model";

import {
    type ChangeInsightWidgetVisProperties,
    changeInsightWidgetVisProperties,
} from "../../../commands/index.js";
import {
    type DashboardCommandFailed,
    type DashboardInsightWidgetVisPropertiesChanged,
} from "../../../events/index.js";
import { selectAnalyticalWidgetByRef } from "../../../store/tabs/layout/layoutSelectors.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import {
    ComplexDashboardIdentifier,
    ComplexDashboardWidgets,
} from "../../../tests/fixtures/ComplexDashboard.fixtures.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";

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
