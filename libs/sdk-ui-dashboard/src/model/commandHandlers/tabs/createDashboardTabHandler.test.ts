// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import {
    absoluteForm,
    relativeForm,
} from "../../../_staging/dateFilterConfig/dateFilterConfig.test.helpers.js";
import { deriveAbsoluteFormGranularitiesFromRelativeForm } from "../../../_staging/dateFilterConfig/merge.js";
import { initializeDashboard } from "../../commands/dashboard.js";
import { createDashboardTab } from "../../commands/tabs.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { selectEffectiveDateFilterConfig } from "../../store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";

describe("createDashboardTabHandler", () => {
    const dateFilterConfig = {
        ref: idRef("createTabDateFilterConfig"),
        absoluteForm,
        relativeForm,
        selectedOption: absoluteForm.localIdentifier,
    };

    it("should derive absoluteForm.availableGranularities for a newly created tab when the feature is enabled", async () => {
        let Tester: DashboardTester;
        await preloadedTesterFactory(
            (tester) => {
                Tester = tester;
            },
            undefined,
            {
                initCommand: initializeDashboard({ dateFilterConfig }),
                backendConfig: {
                    globalSettings: { enableAbsoluteDateFilterGranularity: true },
                },
            },
        );

        Tester!.dispatch(createDashboardTab());
        await Tester!.waitFor("GDC.DASH/EVT.TAB.SWITCHED");

        const effectiveDateFilterConfig = selectEffectiveDateFilterConfig(Tester!.state());

        expect(effectiveDateFilterConfig.absoluteForm).toEqual(
            deriveAbsoluteFormGranularitiesFromRelativeForm(dateFilterConfig, true).absoluteForm,
        );
    });
});
