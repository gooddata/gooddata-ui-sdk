// (C) 2021-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { localIdRef, uriRef } from "@gooddata/sdk-model";

import {
    type IRemoveDrillsForInsightWidget,
    addDrillTargets,
    modifyDrillsForInsightWidget,
    removeDrillsForInsightWidget,
} from "../../../commands/index.js";
import { type IDashboardCommandFailed } from "../../../events/index.js";
import { type IDashboardInsightWidgetDrillsRemoved } from "../../../events/insight.js";
import { selectAnalyticalWidgetByRef } from "../../../store/tabs/layout/layoutSelectors.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { BeforeTestCorrelation, TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import {
    DrillToDashboardFromProductAttributeDefinition,
    DrillToDashboardWithThreeSectionsLocalIdentifier,
    DrillToToInsightFromWonMeasureDefinition,
    SimpleDashboardIdentifier,
    SimpleDashboardSimpleSortedTableWidgetDrillTargets,
    SimpleSortedTableWidgetRef,
} from "../../../tests/fixtures/SimpleDashboard.fixtures.js";

describe("removeDrillsForInsightWidgetHandler", () => {
    const localIdentifier = localIdRef(DrillToDashboardWithThreeSectionsLocalIdentifier);
    const drills = [DrillToToInsightFromWonMeasureDefinition, DrillToDashboardFromProductAttributeDefinition];

    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory(async (tester) => {
            Tester = tester;
            await Tester.dispatchAndWaitFor(
                addDrillTargets(
                    SimpleSortedTableWidgetRef,
                    SimpleDashboardSimpleSortedTableWidgetDrillTargets,
                    BeforeTestCorrelation,
                ),
                "GDC.DASH/EVT.DRILL_TARGETS.ADDED",
            );
            await Tester.dispatchAndWaitFor(
                modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, [], BeforeTestCorrelation),
                "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_MODIFIED",
            );
        }, SimpleDashboardIdentifier);
    });

    describe("remove", () => {
        it("should emit the appropriate events for remove drill for Insight Widget command", async () => {
            await Tester.dispatchAndWaitFor(
                removeDrillsForInsightWidget(SimpleSortedTableWidgetRef, [localIdentifier], TestCorrelation),
                "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_REMOVED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });

        it("should remove one drill for widget and emit event", async () => {
            const event: IDashboardInsightWidgetDrillsRemoved = await Tester.dispatchAndWaitFor(
                removeDrillsForInsightWidget(SimpleSortedTableWidgetRef, [localIdentifier], TestCorrelation),
                "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_REMOVED",
            );

            expect(event.payload.removed).toEqual([DrillToToInsightFromWonMeasureDefinition]);
            expect(event.payload.ref).toEqual(SimpleSortedTableWidgetRef);

            const widgetState = selectAnalyticalWidgetByRef(SimpleSortedTableWidgetRef)(Tester.state());

            expect(widgetState?.drills.length).toBe(1);
            expect(widgetState?.drills).toContainEqual(DrillToDashboardFromProductAttributeDefinition);
        });

        it("should remove all drills for widget and emit event", async () => {
            const event: IDashboardInsightWidgetDrillsRemoved = await Tester.dispatchAndWaitFor(
                removeDrillsForInsightWidget(SimpleSortedTableWidgetRef, "*", TestCorrelation),
                "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_REMOVED",
            );

            expect(event.payload.removed.length).toBe(2);
            expect(event.payload.removed).toContainEqual(DrillToToInsightFromWonMeasureDefinition);
            expect(event.payload.removed).toContainEqual(DrillToDashboardFromProductAttributeDefinition);
            expect(event.payload.ref).toEqual(SimpleSortedTableWidgetRef);

            const widgetState = selectAnalyticalWidgetByRef(SimpleSortedTableWidgetRef)(Tester.state());

            expect(widgetState?.drills.length).toBe(0);
            expect(widgetState?.drills).toEqual([]);
        });
    });

    describe("validate", () => {
        it("should fail if trying to remove drills of non-existent widget", async () => {
            const event: IDashboardCommandFailed<IRemoveDrillsForInsightWidget> =
                await Tester.dispatchAndWaitFor(
                    removeDrillsForInsightWidget(uriRef("missing"), [localIdentifier], TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.message).toMatchSnapshot();
            expect(event.payload.reason).toMatchSnapshot();
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to remove drills where origin missing in widget drills", async () => {
            const event: IDashboardCommandFailed<IRemoveDrillsForInsightWidget> =
                await Tester.dispatchAndWaitFor(
                    removeDrillsForInsightWidget(
                        SimpleSortedTableWidgetRef,
                        [localIdRef("missing")],
                        TestCorrelation,
                    ),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.message).toMatchSnapshot();
            expect(event.payload.reason).toMatchSnapshot();
            expect(event.correlationId).toEqual(TestCorrelation);
        });
    });
});
