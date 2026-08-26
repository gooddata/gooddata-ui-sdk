// (C) 2024-2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";

import { SimpleDashboardIdentifier } from "../../../tests/SimpleDashboard.test.helpers.js";
import { changeVisualizationSwitcherActiveVisualization } from "../../commands/visualizationSwitcher.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import type { IDashboardVisualizationSwitcherWidgetActiveVisualizationChanged } from "../../events/visualizationSwitcher.js";
import { selectVisualizationSwitcherActiveVisualizationByWidgetRef } from "../../store/ui/uiSelectors.js";
import { TestVisualizationSwitcherItem } from "../../tests/Layout.test.helpers.js";

describe("change visualization switcher active visualization handler", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

    it("should update active visualization for visualization switcher widget", async () => {
        const widget = TestVisualizationSwitcherItem.widget!;
        const activeVisualizationIdentifier = "newActiveVis";

        const event: IDashboardVisualizationSwitcherWidgetActiveVisualizationChanged =
            await Tester.dispatchAndWaitFor(
                changeVisualizationSwitcherActiveVisualization(widget.ref, activeVisualizationIdentifier),
                "GDC.DASH/EVT.VISUALIZATION_SWITCHER_WIDGET.ACTIVE_VISUALIZATION_CHANGED",
            );

        expect(event.payload.activeVisualizationIdentifier).toEqual(activeVisualizationIdentifier);
        expect(event.payload.ref).toEqual(widget.ref);

        const activeVisId = selectVisualizationSwitcherActiveVisualizationByWidgetRef(widget.ref)(
            Tester.state(),
        );
        expect(activeVisId).toEqual(activeVisualizationIdentifier);
    });
});
