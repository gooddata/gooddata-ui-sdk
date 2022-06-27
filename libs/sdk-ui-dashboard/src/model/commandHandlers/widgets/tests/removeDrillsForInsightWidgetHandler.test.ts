// (C) 2021-2022 GoodData Corporation

import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester";
import { TestCorrelation, BeforeTestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures";
import {
    addDrillTargets,
    modifyDrillsForInsightWidget,
    RemoveDrillsForInsightWidget,
    removeDrillsForInsightWidget,
} from "../../../commands";
import { localIdRef, uriRef } from "@gooddata/sdk-model";
import { selectAnalyticalWidgetByRef } from "../../../store/layout/layoutSelectors";
import { DashboardInsightWidgetDrillsRemoved } from "../../../events/insight";
import { DashboardCommandFailed } from "../../../events";
import {
    DrillToDashboardFromProductAttributeDefinition,
    DrillToToInsightFromWonMeasureDefinition,
    KpiWidgetRef,
    SimpleDashboardIdentifier,
    SimpleDashboardSimpleSortedTableWidgetDrillTargets,
    SimpleDashboardSimpleSortedTableWonMeasureLocalIdentifier,
    SimpleSortedTableWidgetRef,
} from "../../../tests/fixtures/SimpleDashboard.fixtures";
import { objRefsToStringKey } from "@gooddata/sdk-backend-mockingbird";

describe("removeDrillsForInsightWidgetHandler", () => {
    const fromMeasureLocalIdRef = localIdRef(SimpleDashboardSimpleSortedTableWonMeasureLocalIdentifier);
    const drills = [DrillToToInsightFromWonMeasureDefinition, DrillToDashboardFromProductAttributeDefinition];

    let Tester: DashboardTester;
    beforeEach(
        preloadedTesterFactory(
            async (tester) => {
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
                    modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, BeforeTestCorrelation),
                    "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_MODIFIED",
                );
            },
            SimpleDashboardIdentifier,
            {
                backendConfig: {
                    getCommonAttributesResponses: {
                        [objRefsToStringKey([
                            uriRef("/gdc/md/referenceworkspace/obj/1070"),
                            uriRef("/gdc/md/referenceworkspace/obj/1088"),
                        ])]: [uriRef("/gdc/md/referenceworkspace/obj/1057")],
                    },
                },
            },
        ),
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

            expect(event.payload.removed).toEqual([DrillToToInsightFromWonMeasureDefinition]);
            expect(event.payload.ref).toEqual(SimpleSortedTableWidgetRef);

            const widgetState = selectAnalyticalWidgetByRef(SimpleSortedTableWidgetRef)(Tester.state());

            expect(widgetState?.drills.length).toBe(1);
            expect(widgetState?.drills).toContainEqual(DrillToDashboardFromProductAttributeDefinition);
        });

        it("should remove all drills for widget and emit event", async () => {
            const event: DashboardInsightWidgetDrillsRemoved = await Tester.dispatchAndWaitFor(
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
            const event: DashboardCommandFailed<RemoveDrillsForInsightWidget> =
                await Tester.dispatchAndWaitFor(
                    removeDrillsForInsightWidget(uriRef("missing"), [fromMeasureLocalIdRef], TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.message).toMatchSnapshot();
            expect(event.payload.reason).toMatchSnapshot();
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to remove drills of kpi widget", async () => {
            const event: DashboardCommandFailed<RemoveDrillsForInsightWidget> =
                await Tester.dispatchAndWaitFor(
                    removeDrillsForInsightWidget(KpiWidgetRef, [fromMeasureLocalIdRef], TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.message).toMatchSnapshot();
            expect(event.payload.reason).toMatchSnapshot();
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to remove drills where origin is not specified by localIdRef", async () => {
            const event: DashboardCommandFailed<RemoveDrillsForInsightWidget> =
                await Tester.dispatchAndWaitFor(
                    removeDrillsForInsightWidget(
                        SimpleSortedTableWidgetRef,
                        [uriRef("not-valid-ref")],
                        TestCorrelation,
                    ),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.message).toMatchSnapshot();
            expect(event.payload.reason).toMatchSnapshot();
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to remove drills where origin missing in widget drills", async () => {
            const event: DashboardCommandFailed<RemoveDrillsForInsightWidget> =
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
