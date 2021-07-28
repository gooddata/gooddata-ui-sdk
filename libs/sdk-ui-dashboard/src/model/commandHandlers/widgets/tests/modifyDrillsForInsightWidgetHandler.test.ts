// (C) 2021 GoodData Corporation

import cloneDeep from "lodash/cloneDeep";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester";
import {
    drillToDashboardFromProductAttributeDefinition,
    drillToDashboardFromWonMeasureDefinition,
    drillToToInsightFromWonMeasureDefinition,
    KpiWidgetRef,
    SimpleDashboardIdentifier,
    SimpleDashboardSimpleSortedTableWidgetDrillTargets,
    SimpleSortedTableWidgetRef,
    TestCorrelation,
} from "../../../tests/Dashboard.fixtures";
import { addDrillTargets, modifyDrillsForInsightWidget } from "../../../commands";
import { DashboardCommandFailed, DashboardInsightWidgetDrillsModified } from "../../../events";
import { selectWidgetByRef } from "../../../state/layout/layoutSelectors";
import { uriRef } from "@gooddata/sdk-model";
import { DrillOrigin } from "@gooddata/sdk-backend-spi";

describe("modifyDrillsForInsightWidgetHandler", () => {
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
            Tester.resetMonitors();
        }, SimpleDashboardIdentifier),
    );

    describe("modify", () => {
        it("should emit the appropriate events for modify drill for Insight Widget command", async () => {
            await Tester.dispatchAndWaitFor(
                modifyDrillsForInsightWidget(
                    SimpleSortedTableWidgetRef,
                    [drillToDashboardFromWonMeasureDefinition],
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_MODIFIED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });

        it("should add one drill to state for widget and emit event with one add drill def. No items from state are updated", async () => {
            const drills = [drillToDashboardFromProductAttributeDefinition];

            const origWidgetState = selectWidgetByRef(SimpleSortedTableWidgetRef)(Tester.state());
            const origStateDrill = origWidgetState?.drills[0];

            const event: DashboardInsightWidgetDrillsModified = await Tester.dispatchAndWaitFor(
                modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, TestCorrelation),
                "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_MODIFIED",
            );

            expect(event.payload.updated).toEqual([]);
            expect(event.payload.added).toEqual([drillToDashboardFromProductAttributeDefinition]);

            const widgetState = selectWidgetByRef(SimpleSortedTableWidgetRef)(Tester.state());

            expect(widgetState?.drills.length).toBe(2);
            expect(widgetState?.drills).toContain(origStateDrill);
            expect(widgetState?.drills).toContain(drillToDashboardFromProductAttributeDefinition);
        });

        it("should update state with given drills for widget and emit event with one updated and one added drill def. All items from state are updated", async () => {
            const drills = [
                drillToToInsightFromWonMeasureDefinition,
                drillToDashboardFromProductAttributeDefinition,
            ];

            const event: DashboardInsightWidgetDrillsModified = await Tester.dispatchAndWaitFor(
                modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, TestCorrelation),
                "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_MODIFIED",
            );

            expect(event.payload.updated).toEqual([drillToToInsightFromWonMeasureDefinition]);
            expect(event.payload.added).toEqual([drillToDashboardFromProductAttributeDefinition]);

            const widgetState = selectWidgetByRef(SimpleSortedTableWidgetRef)(Tester.state());

            expect(widgetState?.drills.length).toBe(2);
            expect(widgetState?.drills).toContain(drillToToInsightFromWonMeasureDefinition);
            expect(widgetState?.drills).toContain(drillToDashboardFromProductAttributeDefinition);
        });
    });

    describe("validate", () => {
        it("should fail if trying to modify/add drills of non-existent widget", async () => {
            const drills = [drillToDashboardFromProductAttributeDefinition];

            const event: DashboardCommandFailed = await Tester.dispatchAndWaitFor(
                modifyDrillsForInsightWidget(uriRef("missing"), drills, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload).toMatchSnapshot();
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to modify/add drills of kpi widget", async () => {
            const drills = [drillToDashboardFromProductAttributeDefinition];

            const event: DashboardCommandFailed = await Tester.dispatchAndWaitFor(
                modifyDrillsForInsightWidget(KpiWidgetRef, drills, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload).toMatchSnapshot();
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to modify/add drills and drill targets are not set", async () => {
            const drills = [drillToDashboardFromProductAttributeDefinition];

            Tester.dispatch(
                // this call simulate not set drill targets
                addDrillTargets(SimpleSortedTableWidgetRef, undefined as any, TestCorrelation),
            );

            const event: DashboardCommandFailed = await Tester.dispatchAndWaitFor(
                modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload).toMatchSnapshot();
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to modify/add drills and drill has invalid attribute origin", async () => {
            const invalidAttributeOriginDrill = cloneDeep(drillToDashboardFromProductAttributeDefinition);

            const invalidAttributeOrigin: DrillOrigin = {
                type: "drillFromAttribute",
                attribute: {
                    localIdentifier: "some origin",
                },
            };

            invalidAttributeOriginDrill.origin = invalidAttributeOrigin;
            const drills = [invalidAttributeOriginDrill];
            const event: DashboardCommandFailed = await Tester.dispatchAndWaitFor(
                modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload).toMatchSnapshot();
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to modify/add drills and drill has invalid measure origin", async () => {
            const invalidMeasureOriginDrill = cloneDeep(drillToDashboardFromProductAttributeDefinition);

            const invalidAttributeOrigin: DrillOrigin = {
                type: "drillFromMeasure",
                measure: {
                    localIdentifier: "some origin",
                },
            };

            invalidMeasureOriginDrill.origin = invalidAttributeOrigin;
            const drills = [invalidMeasureOriginDrill];
            const event: DashboardCommandFailed = await Tester.dispatchAndWaitFor(
                modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload).toMatchSnapshot();
            expect(event.correlationId).toEqual(TestCorrelation);
        });
    });
});
