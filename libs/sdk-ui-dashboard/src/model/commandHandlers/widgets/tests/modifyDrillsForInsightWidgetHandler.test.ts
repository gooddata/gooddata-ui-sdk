// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import cloneDeep from "lodash/cloneDeep.js";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import {
    addDrillTargets,
    ModifyDrillsForInsightWidget,
    modifyDrillsForInsightWidget,
} from "../../../commands/index.js";
import { DashboardCommandFailed, DashboardInsightWidgetDrillsModified } from "../../../events/index.js";
import { selectAnalyticalWidgetByRef } from "../../../store/layout/layoutSelectors.js";
import { idRef, uriRef, DrillOrigin } from "@gooddata/sdk-model";
import {
    DrillToAttributeUrlFromMeasureDefinition,
    drillToAttributeUrlWidgetRef,
    DrillToCustomUrlFromMeasureDefinition,
    DrillToDashboardFromProductAttributeDefinition,
    DrillToDashboardFromWonMeasureDefinition,
    DrillToToInsightFromWonMeasureDefinition,
    KpiWidgetRef,
    SimpleDashboarddrillToAttributeUrlWidgetDrillTargets,
    SimpleDashboardIdentifier,
    SimpleDashboardSimpleSortedTableWidgetDrillTargets,
    SimpleSortedTableWidgetInsightIdentifier,
    SimpleSortedTableWidgetRef,
} from "../../../tests/fixtures/SimpleDashboard.fixtures.js";
import { ComplexDashboardWithReferences } from "../../../tests/fixtures/ComplexDashboard.fixtures.js";

describe("modifyDrillsForInsightWidgetHandler", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory(async (tester) => {
            Tester = tester;
            await Tester.dispatchAndWaitFor(
                addDrillTargets(
                    SimpleSortedTableWidgetRef,
                    SimpleDashboardSimpleSortedTableWidgetDrillTargets,
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.DRILL_TARGETS.ADDED",
            );

            await Tester.dispatchAndWaitFor(
                addDrillTargets(
                    drillToAttributeUrlWidgetRef,
                    SimpleDashboarddrillToAttributeUrlWidgetDrillTargets,
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.DRILL_TARGETS.ADDED",
            );
        }, SimpleDashboardIdentifier);
    });

    describe("modify", () => {
        it("should emit the appropriate events for modify drill for Insight Widget command", async () => {
            await Tester.dispatchAndWaitFor(
                modifyDrillsForInsightWidget(
                    SimpleSortedTableWidgetRef,
                    [DrillToDashboardFromWonMeasureDefinition],
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_MODIFIED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });

        it("should add one drill to state for widget and emit event with one add drill def. No items from state are updated", async () => {
            const drills = [DrillToDashboardFromProductAttributeDefinition];

            const origWidgetState = selectAnalyticalWidgetByRef(SimpleSortedTableWidgetRef)(Tester.state());
            const origStateDrill = origWidgetState?.drills[0];

            const event: DashboardInsightWidgetDrillsModified = await Tester.dispatchAndWaitFor(
                modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, TestCorrelation),
                "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_MODIFIED",
            );

            expect(event.payload.updated).toEqual([]);
            expect(event.payload.added).toEqual([DrillToDashboardFromProductAttributeDefinition]);

            const widgetState = selectAnalyticalWidgetByRef(SimpleSortedTableWidgetRef)(Tester.state());

            expect(widgetState?.drills.length).toBe(2);
            expect(widgetState?.drills).toContainEqual(origStateDrill);
            expect(widgetState?.drills).toContainEqual(DrillToDashboardFromProductAttributeDefinition);
        });

        it("should update state with given drills for widget and emit event with one updated and one added drill def. All items from state are updated", async () => {
            const drills = [
                DrillToToInsightFromWonMeasureDefinition,
                DrillToDashboardFromProductAttributeDefinition,
            ];

            const event: DashboardInsightWidgetDrillsModified = await Tester.dispatchAndWaitFor(
                modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, TestCorrelation),
                "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_MODIFIED",
            );

            expect(event.payload.updated).toEqual([DrillToToInsightFromWonMeasureDefinition]);
            expect(event.payload.added).toEqual([DrillToDashboardFromProductAttributeDefinition]);

            const widgetState = selectAnalyticalWidgetByRef(SimpleSortedTableWidgetRef)(Tester.state());

            expect(widgetState?.drills.length).toBe(2);
            expect(widgetState?.drills).toContainEqual(DrillToToInsightFromWonMeasureDefinition);
            expect(widgetState?.drills).toContainEqual(DrillToDashboardFromProductAttributeDefinition);
        });

        it("should correctly update identifier for drillToDashboard target specified by URI", async () => {
            const drillToDashboardUriTarget = cloneDeep(DrillToDashboardFromProductAttributeDefinition);
            drillToDashboardUriTarget.target = uriRef(ComplexDashboardWithReferences.dashboard.uri);
            const drills = [drillToDashboardUriTarget];

            const origWidgetState = selectAnalyticalWidgetByRef(SimpleSortedTableWidgetRef)(Tester.state());
            const origStateDrill = origWidgetState?.drills[0];

            const event: DashboardInsightWidgetDrillsModified = await Tester.dispatchAndWaitFor(
                modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, TestCorrelation),
                "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_MODIFIED",
            );

            expect(event.payload.updated).toEqual([]);
            expect(event.payload.added).toEqual([DrillToDashboardFromProductAttributeDefinition]);

            const widgetState = selectAnalyticalWidgetByRef(SimpleSortedTableWidgetRef)(Tester.state());

            expect(widgetState?.drills.length).toBe(2);
            expect(widgetState?.drills).toContainEqual(origStateDrill);
            expect(widgetState?.drills).toContainEqual(DrillToDashboardFromProductAttributeDefinition);
        });

        it("should correctly update ref for drillToInsight target specified by Identifier", async () => {
            const drillToInsightIdentifierTarget = cloneDeep(DrillToToInsightFromWonMeasureDefinition);
            drillToInsightIdentifierTarget.target = idRef(SimpleSortedTableWidgetInsightIdentifier);
            const drills = [drillToInsightIdentifierTarget];

            const event: DashboardInsightWidgetDrillsModified = await Tester.dispatchAndWaitFor(
                modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, TestCorrelation),
                "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_MODIFIED",
            );

            expect(event.payload.updated).toEqual([DrillToToInsightFromWonMeasureDefinition]);
            const widgetState = selectAnalyticalWidgetByRef(SimpleSortedTableWidgetRef)(Tester.state());

            expect(widgetState?.drills.length).toBe(1);
            expect(widgetState?.drills).toContainEqual(DrillToToInsightFromWonMeasureDefinition);
        });

        it("should correctly update drillToCustomUrl", async () => {
            const drills = [DrillToCustomUrlFromMeasureDefinition];

            const event: DashboardInsightWidgetDrillsModified = await Tester.dispatchAndWaitFor(
                modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, TestCorrelation),
                "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_MODIFIED",
            );

            expect(event.payload.updated).toEqual([DrillToCustomUrlFromMeasureDefinition]);
            const widgetState = selectAnalyticalWidgetByRef(SimpleSortedTableWidgetRef)(Tester.state());

            expect(widgetState?.drills.length).toBe(1);
            expect(widgetState?.drills).toContainEqual(DrillToCustomUrlFromMeasureDefinition);
        });

        it("should correctly add drillToAttributeUrl", async () => {
            const drills = [DrillToAttributeUrlFromMeasureDefinition];

            const event: DashboardInsightWidgetDrillsModified = await Tester.dispatchAndWaitFor(
                modifyDrillsForInsightWidget(drillToAttributeUrlWidgetRef, drills, TestCorrelation),
                "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_MODIFIED",
            );

            expect(event.payload.added).toEqual([DrillToAttributeUrlFromMeasureDefinition]);
            const widgetState = selectAnalyticalWidgetByRef(drillToAttributeUrlWidgetRef)(Tester.state());

            expect(widgetState?.drills.length).toBe(1);
            expect(widgetState?.drills).toContainEqual(DrillToAttributeUrlFromMeasureDefinition);
        });
    });

    describe("validate", () => {
        it("should fail if trying to modify/add drills of non-existent widget", async () => {
            const drills = [DrillToDashboardFromProductAttributeDefinition];

            const event: DashboardCommandFailed<ModifyDrillsForInsightWidget> =
                await Tester.dispatchAndWaitFor(
                    modifyDrillsForInsightWidget(uriRef("missing"), drills, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.reason).toBe("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to modify/add drills of kpi widget", async () => {
            const drills = [DrillToDashboardFromProductAttributeDefinition];

            const event: DashboardCommandFailed<ModifyDrillsForInsightWidget> =
                await Tester.dispatchAndWaitFor(
                    modifyDrillsForInsightWidget(KpiWidgetRef, drills, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.reason).toBe("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to modify/add drills and drill targets are not set", async () => {
            const drills = [DrillToDashboardFromProductAttributeDefinition];

            Tester.dispatch(
                // this call simulate not set drill targets
                addDrillTargets(SimpleSortedTableWidgetRef, undefined as any, TestCorrelation),
            );

            const event: DashboardCommandFailed<ModifyDrillsForInsightWidget> =
                await Tester.dispatchAndWaitFor(
                    modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.reason).toBe("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to modify/add drills and drill has invalid attribute origin", async () => {
            const invalidAttributeOriginDrill = cloneDeep(DrillToDashboardFromProductAttributeDefinition);

            const invalidAttributeOrigin: DrillOrigin = {
                type: "drillFromAttribute",
                attribute: {
                    localIdentifier: "some origin",
                },
            };

            invalidAttributeOriginDrill.origin = invalidAttributeOrigin;
            const drills = [invalidAttributeOriginDrill];
            const event: DashboardCommandFailed<ModifyDrillsForInsightWidget> =
                await Tester.dispatchAndWaitFor(
                    modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.reason).toBe("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to modify/add drills and drill has invalid measure origin", async () => {
            const invalidMeasureOriginDrill = cloneDeep(DrillToDashboardFromProductAttributeDefinition);

            const invalidAttributeOrigin: DrillOrigin = {
                type: "drillFromMeasure",
                measure: {
                    localIdentifier: "some origin",
                },
            };

            invalidMeasureOriginDrill.origin = invalidAttributeOrigin;
            const drills = [invalidMeasureOriginDrill];
            const event: DashboardCommandFailed<ModifyDrillsForInsightWidget> =
                await Tester.dispatchAndWaitFor(
                    modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.reason).toBe("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to modify/add drillToDashboard with not existing target dashboard specified by uri", async () => {
            const invalidTargetDrill = cloneDeep(DrillToDashboardFromProductAttributeDefinition);
            invalidTargetDrill.target = uriRef("missing");

            const drills = [invalidTargetDrill];
            const event: DashboardCommandFailed<ModifyDrillsForInsightWidget> =
                await Tester.dispatchAndWaitFor(
                    modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.reason).toBe("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to modify/add drillToDashboard with not existing target dashboard specified by identifier", async () => {
            const invalidTargetDrill = cloneDeep(DrillToDashboardFromProductAttributeDefinition);
            invalidTargetDrill.target = idRef("missing");

            const drills = [invalidTargetDrill];
            const event: DashboardCommandFailed<ModifyDrillsForInsightWidget> =
                await Tester.dispatchAndWaitFor(
                    modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.reason).toBe("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to modify/add drillToInsight with not existing target insight specified by uri", async () => {
            const invalidTargetDrill = cloneDeep(DrillToToInsightFromWonMeasureDefinition);
            invalidTargetDrill.target = uriRef("missing");

            const drills = [invalidTargetDrill];
            const event: DashboardCommandFailed<ModifyDrillsForInsightWidget> =
                await Tester.dispatchAndWaitFor(
                    modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.reason).toBe("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to modify/add drillToInsight with not existing target insight specified by identifier", async () => {
            const invalidTargetDrill = cloneDeep(DrillToToInsightFromWonMeasureDefinition);
            invalidTargetDrill.target = idRef("missing");

            const drills = [invalidTargetDrill];
            const event: DashboardCommandFailed<ModifyDrillsForInsightWidget> =
                await Tester.dispatchAndWaitFor(
                    modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.reason).toBe("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to modify/add drillToCustomUrl with not existing display form identifier hardcoded in target", async () => {
            const invalidTargetDrill = cloneDeep(DrillToCustomUrlFromMeasureDefinition);
            invalidTargetDrill.target.url =
                "https://www.example.org?dep={attribute_title(label.owner.missing)}";

            const drills = [invalidTargetDrill];
            const event: DashboardCommandFailed<ModifyDrillsForInsightWidget> =
                await Tester.dispatchAndWaitFor(
                    modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.reason).toBe("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to modify/add drillToAttributeUrl with not existing target display form", async () => {
            const invalidTargetDisplayForm = cloneDeep(DrillToAttributeUrlFromMeasureDefinition);
            invalidTargetDisplayForm.target.displayForm = uriRef("missing");

            const drills = [invalidTargetDisplayForm];

            const event: DashboardCommandFailed<ModifyDrillsForInsightWidget> =
                await Tester.dispatchAndWaitFor(
                    modifyDrillsForInsightWidget(drillToAttributeUrlWidgetRef, drills, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.reason).toBe("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to modify/add drillToAttributeUrl with not existing target hyperlink display form", async () => {
            const invalidTargetDisplayForm = cloneDeep(DrillToAttributeUrlFromMeasureDefinition);
            invalidTargetDisplayForm.target.hyperlinkDisplayForm = uriRef("missing");

            const drills = [invalidTargetDisplayForm];

            const event: DashboardCommandFailed<ModifyDrillsForInsightWidget> =
                await Tester.dispatchAndWaitFor(
                    modifyDrillsForInsightWidget(drillToAttributeUrlWidgetRef, drills, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.reason).toBe("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to modify/add drillToAttributeUrl when target hyperlink display form has wrong displayFromType", async () => {
            const invalidTargetDisplayForm = cloneDeep(DrillToAttributeUrlFromMeasureDefinition);

            // set some existing displayForm where is sure that has not type "GDC.link"
            invalidTargetDisplayForm.target.hyperlinkDisplayForm =
                invalidTargetDisplayForm.target.displayForm;

            const drills = [invalidTargetDisplayForm];

            const event: DashboardCommandFailed<ModifyDrillsForInsightWidget> =
                await Tester.dispatchAndWaitFor(
                    modifyDrillsForInsightWidget(drillToAttributeUrlWidgetRef, drills, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.reason).toBe("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });
    });
});
