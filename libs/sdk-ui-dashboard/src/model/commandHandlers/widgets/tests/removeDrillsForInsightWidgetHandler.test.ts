// (C) 2021 GoodData Corporation

import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester";
import {
    drillToDashboardFromProductAttributeDefinition,
    drillToToInsightFromWonMeasureDefinition,
    KpiWidgetRef,
    SimpleDashboardIdentifier,
    SimpleDashboardSimpleSortedTableWidgetDrillTargets,
    SimpleDashboardSimpleSortedTableWonMeasureLocalIdentifier,
    SimpleSortedTableWidgetRef,
    TestCorrelation,
} from "../../../tests/Dashboard.fixtures";
import {
    addDrillTargets,
    modifyDrillsForInsightWidget,
    removeDrillsForInsightWidget,
} from "../../../commands";
import { localIdRef, uriRef } from "@gooddata/sdk-model";
import { selectWidgetByRef } from "../../../state/layout/layoutSelectors";
import { DashboardInsightWidgetDrillsRemoved } from "../../../events/insight";
import { DashboardCommandFailed } from "../../../events";

describe("removeDrillsForInsightWidgetHandler", () => {
    const fromMeasureLocalIdRef = localIdRef(SimpleDashboardSimpleSortedTableWonMeasureLocalIdentifier);
    const drills = [drillToToInsightFromWonMeasureDefinition, drillToDashboardFromProductAttributeDefinition];

    let Tester: DashboardTester;
    beforeEach(
        preloadedTesterFactory((tester) => {
            Tester = tester;
            Tester.dispatch(
                addDrillTargets(
                    SimpleSortedTableWidgetRef,
                    SimpleDashboardSimpleSortedTableWidgetDrillTargets,
                    TestCorrelation,
                ),
            );
            Tester.dispatch(modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills));
            Tester.resetMonitors();
        }, SimpleDashboardIdentifier),
    );

    describe("remove", () => {
        it("should emit the appropriate events for remove drill for Insight Widget command", async () => {
            await Tester.dispatchAndWaitFor(
                removeDrillsForInsightWidget(
                    SimpleSortedTableWidgetRef,
                    [fromMeasureLocalIdRef],
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_REMOVED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });

        it("should remove one drill for widget and emit event", async () => {
            const event: DashboardInsightWidgetDrillsRemoved = await Tester.dispatchAndWaitFor(
                removeDrillsForInsightWidget(
                    SimpleSortedTableWidgetRef,
                    [fromMeasureLocalIdRef],
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_REMOVED",
            );

            expect(event.payload.removed).toEqual([drillToToInsightFromWonMeasureDefinition]);
            expect(event.payload.ref).toEqual(SimpleSortedTableWidgetRef);

            const widgetState = selectWidgetByRef(SimpleSortedTableWidgetRef)(Tester.state());

            expect(widgetState?.drills.length).toBe(1);
            expect(widgetState?.drills).toContain(drillToDashboardFromProductAttributeDefinition);
        });

        it("should remove all drills for widget and emit event", async () => {
            const event: DashboardInsightWidgetDrillsRemoved = await Tester.dispatchAndWaitFor(
                removeDrillsForInsightWidget(SimpleSortedTableWidgetRef, "*", TestCorrelation),
                "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_REMOVED",
            );

            expect(event.payload.removed.length).toBe(2);
            expect(event.payload.removed).toContain(drillToToInsightFromWonMeasureDefinition);
            expect(event.payload.removed).toContain(drillToDashboardFromProductAttributeDefinition);
            expect(event.payload.ref).toEqual(SimpleSortedTableWidgetRef);

            const widgetState = selectWidgetByRef(SimpleSortedTableWidgetRef)(Tester.state());

            expect(widgetState?.drills.length).toBe(0);
            expect(widgetState?.drills).toEqual([]);
        });
    });

    describe("validate", () => {
        it("should fail if trying to remove drills of non-existent widget", async () => {
            const event: DashboardCommandFailed = await Tester.dispatchAndWaitFor(
                removeDrillsForInsightWidget(uriRef("missing"), [fromMeasureLocalIdRef], TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload).toMatchSnapshot({
                command: {
                    meta: {
                        uuid: expect.any(String),
                    },
                },
            });
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to remove drills of kpi widget", async () => {
            const event: DashboardCommandFailed = await Tester.dispatchAndWaitFor(
                removeDrillsForInsightWidget(KpiWidgetRef, [fromMeasureLocalIdRef], TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload).toMatchSnapshot({
                command: {
                    meta: {
                        uuid: expect.any(String),
                    },
                },
            });
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to remove drills where origin is not specified by localIdRef", async () => {
            const event: DashboardCommandFailed = await Tester.dispatchAndWaitFor(
                removeDrillsForInsightWidget(
                    SimpleSortedTableWidgetRef,
                    [uriRef("not-valid-ref")],
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload).toMatchSnapshot({
                command: {
                    meta: {
                        uuid: expect.any(String),
                    },
                },
            });
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to remove drills where origin missing in widget drills", async () => {
            const event: DashboardCommandFailed = await Tester.dispatchAndWaitFor(
                removeDrillsForInsightWidget(
                    SimpleSortedTableWidgetRef,
                    [localIdRef("missing")],
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload).toMatchSnapshot({
                command: {
                    meta: {
                        uuid: expect.any(String),
                    },
                },
            });
            expect(event.correlationId).toEqual(TestCorrelation);
        });
    });
});
