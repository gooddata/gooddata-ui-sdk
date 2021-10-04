// (C) 2021 GoodData Corporation
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester";
import { AddDrillTargets, addDrillTargets } from "../../../commands/drillTargets";
import { DrillTargetsAdded } from "../../../events/drillTargets";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { selectDrillTargetsByWidgetRef } from "../../../store/drillTargets/drillTargetsSelectors";
import { uriRef } from "@gooddata/sdk-model";
import { DashboardCommandFailed } from "../../../events";
import {
    KpiWidgetRef,
    SimpleDashboardIdentifier,
    SimpleSortedTableWidgetRef,
} from "../../../tests/fixtures/SimpleDashboard.fixtures";

describe("addDrillTargetsHandler", () => {
    const availableDrillTargetsMock: IAvailableDrillTargets = {};

    let Tester: DashboardTester;
    beforeEach(
        preloadedTesterFactory((tester: DashboardTester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier),
    );

    it("should add drill target to the state for given widget", async () => {
        const event: DrillTargetsAdded = await Tester.dispatchAndWaitFor(
            addDrillTargets(SimpleSortedTableWidgetRef, availableDrillTargetsMock),
            "GDC.DASH/EVT.DRILL_TARGETS.ADDED",
        );

        expect(event.payload.ref).toEqual(SimpleSortedTableWidgetRef);
        expect(event.payload.availableDrillTargets).toMatchSnapshot();

        const drillTargets = selectDrillTargetsByWidgetRef(SimpleSortedTableWidgetRef)(Tester.state());
        expect(drillTargets?.availableDrillTargets).toEqual(availableDrillTargetsMock);
    });

    it("should fail when trying to add drill targets for non-existing widget", async () => {
        const event: DashboardCommandFailed<AddDrillTargets> = await Tester.dispatchAndWaitFor(
            addDrillTargets(uriRef("bogus"), availableDrillTargetsMock, TestCorrelation),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
        expect(event.correlationId).toEqual(TestCorrelation);
    });

    it("should fail when trying to add drill targets for kpi widget", async () => {
        const event: DashboardCommandFailed<AddDrillTargets> = await Tester.dispatchAndWaitFor(
            addDrillTargets(KpiWidgetRef, availableDrillTargetsMock, TestCorrelation),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
        expect(event.correlationId).toEqual(TestCorrelation);
    });

    it("should emit the appropriate events for add drill target", async () => {
        await Tester.dispatchAndWaitFor(
            addDrillTargets(SimpleSortedTableWidgetRef, availableDrillTargetsMock, TestCorrelation),
            "GDC.DASH/EVT.DRILL_TARGETS.ADDED",
        );

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });
});
