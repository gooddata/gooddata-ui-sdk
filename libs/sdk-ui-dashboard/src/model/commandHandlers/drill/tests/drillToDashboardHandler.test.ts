// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { type IDashboardParameter, type IDrillToDashboard, idRef } from "@gooddata/sdk-model";

import { type IDashboardDrillEvent } from "../../../../types.js";
import { drillToDashboard } from "../../../commands/drill.js";
import { createDashboardTab, switchDashboardTab } from "../../../commands/tabs.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { selectActiveTabLocalIdentifier } from "../../../store/tabs/tabsSelectors.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import {
    SimpleDashboardIdentifier,
    SimpleSortedTableWidgetRef,
} from "../../../tests/fixtures/SimpleDashboard.fixtures.js";

describe("drillToDashboardHandler parameter inheritance", () => {
    const topNRef = idRef("topN", "parameter");
    const topNParameter: IDashboardParameter = {
        ref: topNRef,
        parameterType: "NUMBER",
        mode: "active",
    };

    const selfDrillDefinition: IDrillToDashboard = {
        type: "drillToDashboard",
        transition: "in-place",
        origin: { type: "drillFromMeasure", measure: { localIdentifier: "m1" } },
        target: idRef(SimpleDashboardIdentifier),
    };

    const drillEvent = {
        dataView: {} as never,
        drillContext: { type: "table", element: "cell", intersection: [] },
        drillDefinitions: [],
        widgetRef: SimpleSortedTableWidgetRef,
    } as IDashboardDrillEvent;

    let Tester: DashboardTester;
    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
        Tester.dispatch(tabsActions.addParameter({ parameter: topNParameter, workspaceDefault: 5 }));
        Tester.dispatch(tabsActions.setParameterRuntimeValue({ ref: topNRef, value: 3 }));
    });

    it("carries the source tab's active parameter overrides in the resolved payload (drill to self)", async () => {
        const event = await Tester.dispatchAndWaitFor(
            drillToDashboard(selfDrillDefinition, drillEvent),
            "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.RESOLVED",
        );

        expect(event.payload.parameters).toEqual([{ ref: topNRef, value: 3 }]);
    });

    it("carries a parameter left at its workspace default (F1-2604)", async () => {
        Tester.dispatch(tabsActions.setParameterRuntimeValue({ ref: topNRef, value: 5 }));

        const event = await Tester.dispatchAndWaitFor(
            drillToDashboard(selfDrillDefinition, drillEvent),
            "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.RESOLVED",
        );

        expect(event.payload.parameters).toEqual([{ ref: topNRef, value: 5 }]);
    });

    it("reads overrides from the source tab, not the target tab, when the drill switches tabs", async () => {
        const sourceTabId = Tester.select(selectActiveTabLocalIdentifier)!;

        await Tester.dispatchAndWaitFor(createDashboardTab("Tab 2"), "GDC.DASH/EVT.TAB.SWITCHED");
        const targetTabId = Tester.select(selectActiveTabLocalIdentifier)!;
        Tester.dispatch(tabsActions.addParameter({ parameter: topNParameter, workspaceDefault: 5 }));
        Tester.dispatch(tabsActions.setParameterRuntimeValue({ ref: topNRef, value: 7 }));

        await Tester.dispatchAndWaitFor(switchDashboardTab(sourceTabId), "GDC.DASH/EVT.TAB.SWITCHED");

        const event = await Tester.dispatchAndWaitFor(
            drillToDashboard({ ...selfDrillDefinition, targetTabLocalIdentifier: targetTabId }, drillEvent),
            "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.RESOLVED",
        );

        expect(event.payload.parameters).toEqual([{ ref: topNRef, value: 3 }]);
    });

    it("marks the tab switch as drill-originated so saved filter state is not restored over the drill", async () => {
        const sourceTabId = Tester.select(selectActiveTabLocalIdentifier)!;

        await Tester.dispatchAndWaitFor(createDashboardTab("Tab 2"), "GDC.DASH/EVT.TAB.SWITCHED");
        const targetTabId = Tester.select(selectActiveTabLocalIdentifier)!;

        await Tester.dispatchAndWaitFor(switchDashboardTab(sourceTabId), "GDC.DASH/EVT.TAB.SWITCHED");

        const tabSwitched = await Tester.dispatchAndWaitFor(
            drillToDashboard({ ...selfDrillDefinition, targetTabLocalIdentifier: targetTabId }, drillEvent),
            "GDC.DASH/EVT.TAB.SWITCHED",
        );

        expect(tabSwitched.payload.newTabId).toEqual(targetTabId);
        expect(tabSwitched.payload.source).toEqual("drillToSelf");
    });
});
