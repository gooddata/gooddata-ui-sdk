// (C) 2021-2025 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";

import { AddDrillTargets, addDrillTargets } from "../../../commands/drillTargets.js";
import { changeRenderMode } from "../../../commands/renderMode.js";
import { DrillTargetsAdded } from "../../../events/drillTargets.js";
import { DashboardCommandFailed } from "../../../events/index.js";
import { selectDrillTargetsByWidgetRef } from "../../../store/drillTargets/drillTargetsSelectors.js";
import { selectInvalidDrillWidgetRefs } from "../../../store/ui/uiSelectors.js";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import {
    SimpleDashboardIdentifier,
    SimpleSortedTableWidgetRef,
} from "../../../tests/fixtures/SimpleDashboard.fixtures.js";

describe("addDrillTargetsHandler", () => {
    const availableDrillTargetsMock: IAvailableDrillTargets = {};

    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

    it("should not have invalid drills when drill targets are not set", async () => {
        // switch to edit mode run drill validation
        await Tester.dispatchAndWaitFor(changeRenderMode("edit"), "GDC.DASH/EVT.RENDER_MODE.CHANGED");

        const drillTargets = Tester.select(selectDrillTargetsByWidgetRef(SimpleSortedTableWidgetRef));
        const invalidDrillWidgetRefs = Tester.select(selectInvalidDrillWidgetRefs);

        expect(drillTargets?.availableDrillTargets).toEqual(undefined);
        expect(invalidDrillWidgetRefs).toEqual([]);
    });

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

    it("should emit the appropriate events for add drill target", async () => {
        await Tester.dispatchAndWaitFor(
            addDrillTargets(SimpleSortedTableWidgetRef, availableDrillTargetsMock, TestCorrelation),
            "GDC.DASH/EVT.DRILL_TARGETS.ADDED",
        );

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });
});
