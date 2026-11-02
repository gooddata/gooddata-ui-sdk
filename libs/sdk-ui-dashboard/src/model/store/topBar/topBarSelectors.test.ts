// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import {
    EmptyDashboardIdentifier,
    EmptyDashboardWithReferences,
} from "../../../tests/Dashboard.test.helpers.js";
import { SimpleDashboardIdentifier } from "../../../tests/SimpleDashboard.test.helpers.js";
import { EmptyDashboardLayout } from "../../commandHandlers/dashboard/common/dashboardInitialize.js";
import { createDashboardTab } from "../../commands/tabs.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { type PrivateDashboardContext } from "../../types/commonTypes.js";
import { selectConfig } from "../config/configSelectors.js";
import { configActions } from "../config/index.js";
import { selectLayoutHasAnalyticalWidgets } from "../tabs/layout/layoutSelectors.js";

import { selectIsSaveAsNewEnabled } from "./topBarSelectors.js";

// the recorded empty dashboard has no layout, which the initializer reports as an error
const emptyDashboardWithLayout: PrivateDashboardContext = {
    preloadedDashboard: {
        ...EmptyDashboardWithReferences.dashboard,
        ref: idRef(EmptyDashboardIdentifier),
        identifier: EmptyDashboardIdentifier,
        layout: EmptyDashboardLayout,
    },
};

async function loadDashboard(identifier?: string, customizationFns?: PrivateDashboardContext) {
    let tester: DashboardTester | undefined;
    await preloadedTesterFactory(
        (loaded) => {
            tester = loaded;
        },
        identifier,
        { customizationFns },
    );
    if (!tester) {
        throw new Error("dashboard tester was not loaded");
    }
    return tester;
}

describe("selectIsSaveAsNewEnabled", () => {
    it("is false for a dashboard without analytical widgets", async () => {
        const tester = await loadDashboard(EmptyDashboardIdentifier, emptyDashboardWithLayout);

        expect(tester.select(selectIsSaveAsNewEnabled)).toBe(false);
    });

    it("is true for a dashboard with an analytical widget", async () => {
        const tester = await loadDashboard(SimpleDashboardIdentifier);

        expect(tester.select(selectIsSaveAsNewEnabled)).toBe(true);
    });

    it("is true on an empty tab when another tab has an analytical widget", async () => {
        const tester = await loadDashboard(SimpleDashboardIdentifier);
        tester.dispatch(createDashboardTab());
        await tester.waitFor("GDC.DASH/EVT.TAB.SWITCHED");

        expect(tester.select(selectLayoutHasAnalyticalWidgets)).toBe(false);
        expect(tester.select(selectIsSaveAsNewEnabled)).toBe(true);
    });

    it("is false for a new dashboard", async () => {
        const tester = await loadDashboard();

        expect(tester.select(selectIsSaveAsNewEnabled)).toBe(false);
    });

    it("is false for a read-only dashboard", async () => {
        const tester = await loadDashboard(SimpleDashboardIdentifier);
        tester.dispatch(configActions.setConfig({ ...selectConfig(tester.state()), isReadOnly: true }));

        expect(tester.select(selectIsSaveAsNewEnabled)).toBe(false);
    });
});
