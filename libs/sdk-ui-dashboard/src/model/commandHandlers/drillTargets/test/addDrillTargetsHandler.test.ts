// (C) 2021 GoodData Corporation
import { uriRef } from "@gooddata/sdk-model";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester";
import { addDrillTargets } from "../../../commands/drillTargets";
import { DrillTargetsAdded } from "../../../events/drillTargets";
import { SimpleDashboardIdentifier } from "../../../tests/Dashboard.fixtures";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { selectDrillTargetsByWidgetRef } from "../../../state/drillTargets/drillTargetsSelectors";

describe("addDrillTargetsHandler", () => {
    const widgetRef = uriRef("someuri");
    const availableDrillTargetsMock: IAvailableDrillTargets = {};

    let Tester: DashboardTester;
    beforeEach(
        preloadedTesterFactory((tester: DashboardTester) => (Tester = tester), SimpleDashboardIdentifier),
    );

    it("should add  drill target to the state for given widget", async () => {
        const event: DrillTargetsAdded = await Tester.dispatchAndWaitFor(
            addDrillTargets(widgetRef, availableDrillTargetsMock),
            "GDC.DASH/EVT.DRILL_TARGETS.ADDED",
        );
        expect(event.payload.widgetRef).toEqual(widgetRef);
        expect(event.payload.availableDrillTargets).toMatchSnapshot();

        const drillTargets = selectDrillTargetsByWidgetRef(widgetRef)(Tester.state());
        expect(drillTargets?.availableDrillTargets).toEqual(availableDrillTargetsMock);
    });

    it("should emit the appropriate events for add drill target", async () => {
        await Tester.dispatchAndWaitFor(
            addDrillTargets(widgetRef, availableDrillTargetsMock, "testCorrelation"),
            "GDC.DASH/EVT.DRILL_TARGETS.ADDED",
        );

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });
});
