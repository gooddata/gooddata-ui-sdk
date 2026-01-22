// (C) 2022-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { type IInsightWidget, insightRef, uriRef } from "@gooddata/sdk-model";

import { type IChangeInsightWidgetInsight, changeInsightWidgetInsight } from "../../../commands/insight.js";
import { type IDashboardCommandFailed } from "../../../events/general.js";
import { type IDashboardInsightWidgetInsightSwitched } from "../../../events/insight.js";
import { selectAnalyticalWidgetByRef } from "../../../store/tabs/layout/layoutSelectors.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { PivotTableWithRowAndColumnAttributes } from "../../../tests/fixtures/Insights.fixtures.js";
import {
    SimpleDashboardIdentifier,
    SimpleSortedTableWidgetRef,
} from "../../../tests/fixtures/SimpleDashboard.fixtures.js";

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

        const event: IDashboardInsightWidgetInsightSwitched = await Tester.dispatchAndWaitFor(
            changeInsightWidgetInsight(ref, insight, undefined, TestCorrelation),
            "GDC.DASH/EVT.INSIGHT_WIDGET.INSIGHT_SWITCHED",
        );

        expect(insightRef(event.payload.insight)).toEqual(insight);
        const widgetState = selectAnalyticalWidgetByRef(ref)(Tester.state()) as IInsightWidget;
        expect(widgetState.insight).toEqual(insight);
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
        expect(widgetState.properties).toEqual(properties);
    });

    it("should fail if trying to change the insight of non-existent widget", async () => {
        const insight = insightRef(PivotTableWithRowAndColumnAttributes);

        const event: IDashboardCommandFailed<IChangeInsightWidgetInsight> = await Tester.dispatchAndWaitFor(
            changeInsightWidgetInsight(uriRef("missing"), insight, undefined, TestCorrelation),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
        expect(event.correlationId).toEqual(TestCorrelation);
    });

    it("should fail if trying to change the insight for non-existing insight", async () => {
        const ref = SimpleSortedTableWidgetRef;

        const event: IDashboardCommandFailed<IChangeInsightWidgetInsight> = await Tester.dispatchAndWaitFor(
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
