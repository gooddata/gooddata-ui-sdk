// (C) 2021 GoodData Corporation
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester";
import { addDrillTargets } from "../../../commands/drillTargets";
import { DrillTargetsAdded } from "../../../events/drillTargets";
import {
    SimpleDashboardFirstWidgetRef,
    SimpleDashboardIdentifier,
    TestCorrelation,
} from "../../../tests/Dashboard.fixtures";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { selectDrillTargetsByWidgetRef } from "../../../state/drillTargets/drillTargetsSelectors";
import { uriRef } from "@gooddata/sdk-model";
import { DashboardCommandFailed } from "../../../events";

describe("addDrillTargetsHandler", () => {
    const availableDrillTargetsMock: IAvailableDrillTargets = {};

    let Tester: DashboardTester;
    beforeEach(
        preloadedTesterFactory((tester: DashboardTester) => (Tester = tester), SimpleDashboardIdentifier),
    );

    it("should add drill target to the state for given widget", async () => {
        const event: DrillTargetsAdded = await Tester.dispatchAndWaitFor(
            addDrillTargets(SimpleDashboardFirstWidgetRef, availableDrillTargetsMock),
            "GDC.DASH/EVT.DRILL_TARGETS.ADDED",
        );

        expect(event.payload.widgetRef).toEqual(SimpleDashboardFirstWidgetRef);
        expect(event.payload.availableDrillTargets).toMatchSnapshot();

        const drillTargets = selectDrillTargetsByWidgetRef(SimpleDashboardFirstWidgetRef)(Tester.state());
        expect(drillTargets?.availableDrillTargets).toEqual(availableDrillTargetsMock);
    });

    it("should fail when trying to add drill targets for non-existing widget", async () => {
        const event: DashboardCommandFailed = await Tester.dispatchAndWaitFor(
            addDrillTargets(uriRef("bogus"), availableDrillTargetsMock, TestCorrelation),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
        expect(event.correlationId).toEqual(TestCorrelation);
    });

    it("should emit the appropriate events for add drill target", async () => {
        await Tester.dispatchAndWaitFor(
            addDrillTargets(SimpleDashboardFirstWidgetRef, availableDrillTargetsMock, TestCorrelation),
            "GDC.DASH/EVT.DRILL_TARGETS.ADDED",
        );

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });
});
