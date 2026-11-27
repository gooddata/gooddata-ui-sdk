// (C) 2026 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IDashboardFilterView, idRef } from "@gooddata/sdk-model";

import { selectFilterViews } from "../../../../model/store/filterViews/filterViewsReducersSelectors.js";
import {
    selectDisableFilterViews,
    selectIsNewDashboard,
} from "../../../../model/store/meta/metaSelectors.js";
import { selectCanCreateFilterView } from "../../../../model/store/permissions/permissionsSelectors.js";
import {
    selectFilterViewsDialogMode,
    selectIsFilterViewsDialogOpen,
} from "../../../../model/store/ui/uiSelectors.js";
import { IntlWrapper } from "../../../localization/IntlWrapper.js";

import { FilterViews } from "./FilterViews.js";

const filterViews: IDashboardFilterView[] = [
    {
        name: "First view",
        ref: idRef("view-0"),
        dashboard: idRef("dashboard"),
        user: idRef("user"),
        filterContext: { title: "", description: "", filters: [] },
    },
];

vi.mock("../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardDispatch: () => () => {},
    useDashboardSelector: (selector: unknown) => {
        switch (selector) {
            case selectIsFilterViewsDialogOpen:
                return true;
            case selectFilterViewsDialogMode:
                return "list";
            case selectFilterViews:
                return filterViews;
            case selectDisableFilterViews:
            case selectIsNewDashboard:
                return false;
            case selectCanCreateFilterView:
                return true;
            default:
                return false;
        }
    },
}));

vi.mock("../../../../model/react/useDashboardUserInteraction.js", () => ({
    useDashboardUserInteraction: () => ({ savedFilterViewInteraction: () => {} }),
}));

vi.mock("./useFilterViewsToastMessages.js", () => ({
    useFilterViewsToastMessages: () => {},
}));

describe("FilterViews", () => {
    it("moves Tab from the trigger into the open panel, not to the content after the trigger", async () => {
        render(
            <IntlWrapper>
                <FilterViews />
                <button type="button">Show as table</button>
            </IntlWrapper>,
        );
        const trigger = screen.getByRole("button", { name: "My views (1)" });
        // Let the panel's autofocus finish first; it stops after its first successful focus,
        // so the focus checked below can only come from the trigger's Tab handling.
        await waitFor(() =>
            expect(screen.getByRole("button", { name: "Information about Saved Views" })).toHaveFocus(),
        );
        const infoButton = screen.getByRole("button", { name: "Information about Saved Views" });
        trigger.focus();

        // The browser's default Tab would follow the DOM order to the content after the trigger,
        // because the panel is portalled to the end of <body>.
        const isDefaultTabAllowed = fireEvent.keyDown(trigger, { key: "Tab", code: "Tab" });

        expect(isDefaultTabAllowed).toBe(false);
        expect(screen.getByRole("button", { name: "Show as table" })).not.toHaveFocus();
        expect(infoButton).toHaveFocus();
    });

    it("keeps Shift+Tab from the trigger on its default behaviour", () => {
        render(
            <IntlWrapper>
                <FilterViews />
            </IntlWrapper>,
        );
        const trigger = screen.getByRole("button", { name: "My views (1)" });
        trigger.focus();

        expect(fireEvent.keyDown(trigger, { key: "Tab", code: "Tab", shiftKey: true })).toBe(true);
    });
});
