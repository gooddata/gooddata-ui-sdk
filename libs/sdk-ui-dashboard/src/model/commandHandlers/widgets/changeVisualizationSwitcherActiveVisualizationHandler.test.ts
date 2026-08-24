// (C) 2024-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { changeVisualizationSwitcherActiveVisualization } from "../../commands/visualizationSwitcher.js";
import type { IDashboardVisualizationSwitcherWidgetActiveVisualizationChanged } from "../../events/visualizationSwitcher.js";
import { selectVisualizationSwitcherActiveVisualizationByWidgetRef } from "../../store/ui/uiSelectors.js";
import { type DashboardTester, preloadedTesterFactory } from "../../tests/DashboardTester.js";
import { TestVisualizationSwitcherItem } from "../../tests/fixtures/Layout.fixtures.js";
import { SimpleDashboardIdentifier } from "../../tests/fixtures/SimpleDashboard.fixtures.js";

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
