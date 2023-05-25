// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import {
    ChangeKpiWidgetComparison,
    changeKpiWidgetComparison,
    KpiWidgetComparison,
} from "../../../commands/index.js";
import { DashboardCommandFailed, DashboardKpiWidgetComparisonChanged } from "../../../events/index.js";
import { selectAnalyticalWidgetByRef } from "../../../store/layout/layoutSelectors.js";
import { uriRef, IKpiWidget } from "@gooddata/sdk-model";
import {
    ComplexDashboardIdentifier,
    ComplexDashboardWidgets,
} from "../../../tests/fixtures/ComplexDashboard.fixtures.js";

describe("change KPI widget comparison handler", () => {
    describe("for dashboard with KPIs and insights", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, ComplexDashboardIdentifier);
        });

        const TestComparisonWithDirection: KpiWidgetComparison = {
            comparisonType: "previousPeriod",
            comparisonDirection: "growIsBad",
        };
        const TestComparisonWithoutDirection: KpiWidgetComparison = { comparisonType: "previousPeriod" };
        const TestNoComparison: KpiWidgetComparison = { comparisonType: "none" };
        const TestEmptyComparison: KpiWidgetComparison = {};

        it("should change KPI comparison when fully defined", async () => {
            const ref = ComplexDashboardWidgets.FirstSection.FirstKpi.ref;

            const event: DashboardKpiWidgetComparisonChanged = await Tester.dispatchAndWaitFor(
                changeKpiWidgetComparison(ref, TestComparisonWithDirection),
                "GDC.DASH/EVT.KPI_WIDGET.COMPARISON_CHANGED",
            );

            expect(event.payload.kpi.comparisonType).toEqual("previousPeriod");
            expect(event.payload.kpi.comparisonDirection).toEqual("growIsBad");
            const widgetState: IKpiWidget = selectAnalyticalWidgetByRef(ref)(Tester.state()) as IKpiWidget;
            expect(widgetState.kpi.comparisonType).toEqual(event.payload.kpi.comparisonType);
            expect(widgetState.kpi.comparisonDirection).toEqual(event.payload.kpi.comparisonDirection);
        });

        it("should change KPI comparison when only type is specified and use default direction", async () => {
            const ref = ComplexDashboardWidgets.FirstSection.FirstKpi.ref;

            const event: DashboardKpiWidgetComparisonChanged = await Tester.dispatchAndWaitFor(
                changeKpiWidgetComparison(ref, TestComparisonWithoutDirection),
                "GDC.DASH/EVT.KPI_WIDGET.COMPARISON_CHANGED",
            );

            expect(event.payload.kpi.comparisonType).toEqual("previousPeriod");
            expect(event.payload.kpi.comparisonDirection).toEqual("growIsGood");
            const widgetState: IKpiWidget = selectAnalyticalWidgetByRef(ref)(Tester.state()) as IKpiWidget;
            expect(widgetState.kpi.comparisonType).toEqual(event.payload.kpi.comparisonType);
            expect(widgetState.kpi.comparisonDirection).toEqual(event.payload.kpi.comparisonDirection);
        });

        it("should turn off KPI comparison", async () => {
            const ref = ComplexDashboardWidgets.FirstSection.FirstKpi.ref;

            const event: DashboardKpiWidgetComparisonChanged = await Tester.dispatchAndWaitFor(
                changeKpiWidgetComparison(ref, TestNoComparison),
                "GDC.DASH/EVT.KPI_WIDGET.COMPARISON_CHANGED",
            );

            expect(event.payload.kpi.comparisonType).toEqual("none");
            expect(event.payload.kpi.comparisonDirection).toBeUndefined();
            const widgetState: IKpiWidget = selectAnalyticalWidgetByRef(ref)(Tester.state()) as IKpiWidget;
            expect(widgetState.kpi.comparisonType).toEqual(event.payload.kpi.comparisonType);
            expect(widgetState.kpi.comparisonDirection).toBeUndefined();
        });

        it("should turn off KPI comparison when empty input", async () => {
            const ref = ComplexDashboardWidgets.FirstSection.FirstKpi.ref;

            const event: DashboardKpiWidgetComparisonChanged = await Tester.dispatchAndWaitFor(
                changeKpiWidgetComparison(ref, TestEmptyComparison),
                "GDC.DASH/EVT.KPI_WIDGET.COMPARISON_CHANGED",
            );

            expect(event.payload.kpi.comparisonType).toEqual("none");
            expect(event.payload.kpi.comparisonDirection).toBeUndefined();
            const widgetState: IKpiWidget = selectAnalyticalWidgetByRef(ref)(Tester.state()) as IKpiWidget;
            expect(widgetState.kpi.comparisonType).toEqual(event.payload.kpi.comparisonType);
            expect(widgetState.kpi.comparisonDirection).toBeUndefined();
        });

        it("should fail if trying to change title of insight widget", async () => {
            const ref = ComplexDashboardWidgets.SecondSection.FirstTable.ref;
            const event: DashboardCommandFailed<ChangeKpiWidgetComparison> = await Tester.dispatchAndWaitFor(
                changeKpiWidgetComparison(ref, TestComparisonWithDirection, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to change title of non-existent widget", async () => {
            const event: DashboardCommandFailed<ChangeKpiWidgetComparison> = await Tester.dispatchAndWaitFor(
                changeKpiWidgetComparison(uriRef("missing"), TestComparisonWithDirection, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should emit correct events", async () => {
            const ref = ComplexDashboardWidgets.FirstSection.FirstKpi.ref;

            await Tester.dispatchAndWaitFor(
                changeKpiWidgetComparison(ref, TestComparisonWithDirection, TestCorrelation),
                "GDC.DASH/EVT.KPI_WIDGET.COMPARISON_CHANGED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });
});
