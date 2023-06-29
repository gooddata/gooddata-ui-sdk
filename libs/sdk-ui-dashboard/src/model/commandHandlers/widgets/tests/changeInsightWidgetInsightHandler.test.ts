// (C) 2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { ChangeInsightWidgetInsight, changeInsightWidgetInsight } from "../../../commands/index.js";
import { DashboardCommandFailed, DashboardInsightWidgetInsightSwitched } from "../../../events/index.js";
import { PivotTableWithRowAndColumnAttributes } from "../../../tests/fixtures/Insights.fixtures.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { selectAnalyticalWidgetByRef } from "../../../store/layout/layoutSelectors.js";
import {
    SimpleDashboardIdentifier,
    SimpleSortedTableWidgetRef,
    KpiWidgetRef,
} from "../../../tests/fixtures/SimpleDashboard.fixtures.js";
import { IInsightWidget, insightRef, uriRef } from "@gooddata/sdk-model";

describe("change insight widget vis properties handler", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

    it("should change the insight for existing insight widget", async () => {
        const ref = SimpleSortedTableWidgetRef;
        const insight = insightRef(PivotTableWithRowAndColumnAttributes);

        const event: DashboardInsightWidgetInsightSwitched = await Tester.dispatchAndWaitFor(
            changeInsightWidgetInsight(ref, insight, undefined, TestCorrelation),
            "GDC.DASH/EVT.INSIGHT_WIDGET.INSIGHT_SWITCHED",
        );

        expect(insightRef(event.payload.insight)).toEqual(insight);
        const widgetState = selectAnalyticalWidgetByRef(ref)(Tester.state()) as IInsightWidget;
        expect(widgetState!.insight).toEqual(insight);
    });

    it("should change the insight and the visualization properties for existing insight widget", async () => {
        const ref = SimpleSortedTableWidgetRef;
        const insight = insightRef(PivotTableWithRowAndColumnAttributes);
        const properties = { foo: "bar" };

        await Tester.dispatchAndWaitFor(
            changeInsightWidgetInsight(ref, insight, properties, TestCorrelation),
            "GDC.DASH/EVT.INSIGHT_WIDGET.INSIGHT_SWITCHED",
        );

        const widgetState = selectAnalyticalWidgetByRef(ref)(Tester.state()) as IInsightWidget;
        expect(widgetState!.properties).toEqual(properties);
    });

    it("should fail if trying to change the insight of KPI widget", async () => {
        const ref = KpiWidgetRef;
        const insight = insightRef(PivotTableWithRowAndColumnAttributes);

        const event: DashboardCommandFailed<ChangeInsightWidgetInsight> = await Tester.dispatchAndWaitFor(
            changeInsightWidgetInsight(ref, insight, undefined, TestCorrelation),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
        expect(event.correlationId).toEqual(TestCorrelation);
    });

    it("should fail if trying to change the insight of non-existent widget", async () => {
        const insight = insightRef(PivotTableWithRowAndColumnAttributes);

        const event: DashboardCommandFailed<ChangeInsightWidgetInsight> = await Tester.dispatchAndWaitFor(
            changeInsightWidgetInsight(uriRef("missing"), insight, undefined, TestCorrelation),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
        expect(event.correlationId).toEqual(TestCorrelation);
    });

    it("should fail if trying to change the insight for non-existing insight", async () => {
        const ref = SimpleSortedTableWidgetRef;

        const event: DashboardCommandFailed<ChangeInsightWidgetInsight> = await Tester.dispatchAndWaitFor(
            changeInsightWidgetInsight(ref, uriRef("missing"), undefined, TestCorrelation),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
        expect(event.correlationId).toEqual(TestCorrelation);
    });

    it("should emit correct events", async () => {
        const ref = SimpleSortedTableWidgetRef;
        const insight = insightRef(PivotTableWithRowAndColumnAttributes);

        await Tester.dispatchAndWaitFor(
            changeInsightWidgetInsight(ref, insight, undefined, TestCorrelation),
            "GDC.DASH/EVT.INSIGHT_WIDGET.INSIGHT_SWITCHED",
        );

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });
});
