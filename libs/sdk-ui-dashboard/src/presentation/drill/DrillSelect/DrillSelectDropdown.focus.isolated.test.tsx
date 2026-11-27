// (C) 2026 GoodData Corporation

import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { newInsightMap } from "../../../_staging/metadata/objRefMap.js";
import { selectAccessibleDashboards } from "../../../model/store/accessibleDashboards/accessibleDashboardsSelectors.js";
import { selectCatalogAttributeDisplayFormsById } from "../../../model/store/catalog/catalogSelectors.js";
import { selectEnableSecondGranularities } from "../../../model/store/config/configSelectors.js";
import { selectInsightsMap } from "../../../model/store/insights/insightsSelectors.js";
import { selectDashboardTitle } from "../../../model/store/meta/metaSelectors.js";
import { selectIsDrillRestricted } from "../../../model/store/widgetDrills/drillRestrictionSelectors.js";
import { IntlWrapper } from "../../localization/IntlWrapper.js";
import { createDrillEvent, keyDriverAnalysis } from "../utils/kdaUtils.test.helpers.js";

const selectorValues = new Map<unknown, unknown>();

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => selectorValues.get(selector),
}));

const { DrillSelectDropdown } = await import("./DrillSelectDropdown.js");

const ANCHOR_CLASS = "s-drill-picker-test";

describe("DrillSelectDropdown focus", () => {
    const originalFocus = HTMLElement.prototype.focus;

    beforeEach(() => {
        selectorValues.set(selectIsDrillRestricted, () => false);
        selectorValues.set(selectAccessibleDashboards, []);
        selectorValues.set(selectDashboardTitle, "Dashboard");
        selectorValues.set(selectInsightsMap, newInsightMap([]));
        selectorValues.set(selectCatalogAttributeDisplayFormsById, {});
        selectorValues.set(selectEnableSecondGranularities, false);

        // Browsers ignore `.focus()` on elements inside a `visibility: hidden` ancestor, which is
        // how Overlay renders its content until it is aligned. jsdom does not, so emulate it.
        HTMLElement.prototype.focus = function (this: HTMLElement, options?: FocusOptions) {
            if (this.closest("[style*='visibility: hidden']")) {
                return;
            }
            originalFocus.call(this, options);
        };
    });

    afterEach(() => {
        HTMLElement.prototype.focus = originalFocus;
        selectorValues.clear();
    });

    it("moves focus into the menu once the overlay is aligned and shown", async () => {
        const trigger = document.createElement("button");
        document.body.appendChild(trigger);
        trigger.focus();

        render(
            <IntlWrapper locale="en-US">
                <div className={ANCHOR_CLASS}>
                    <DrillSelectDropdown
                        isOpen
                        dropDownAnchorClass={ANCHOR_CLASS}
                        drillDefinitions={[keyDriverAnalysis]}
                        restrictedDrillDowns={[]}
                        drillEvent={{
                            ...createDrillEvent(false, 1),
                            drillDefinitions: [keyDriverAnalysis],
                        }}
                        onClose={vi.fn()}
                        onCloseReturnFocus={vi.fn()}
                        onSelect={vi.fn()}
                    />
                </div>
            </IntlWrapper>,
        );

        // Overlay keeps the menu hidden until it is aligned.
        const hiddenMenu = document.getElementById("drill-select-menu");
        expect(hiddenMenu?.closest("[style*='visibility: hidden']")).not.toBeNull();

        await waitFor(() => expect(screen.getByRole("menu", { name: "Choose drill action" })).toHaveFocus());
        expect(screen.getByRole("menu", { name: "Choose drill action" })).toBe(hiddenMenu);

        trigger.remove();
    });
});
