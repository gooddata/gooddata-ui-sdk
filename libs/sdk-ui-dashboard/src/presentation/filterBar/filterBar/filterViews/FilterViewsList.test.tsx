// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import { type IDashboardFilterView, idRef } from "@gooddata/sdk-model";

import { ReactDashboardContext } from "../../../../model/react/DashboardStoreProvider.js";
import { IntlWrapper } from "../../../localization/IntlWrapper.js";

import { FilterViewsList } from "./FilterViewsList.js";

function renderList() {
    const store = configureStore({
        reducer: () => ({
            permissions: { permissions: { canCreateFilterView: true } },
            filterViews: { isLoading: false },
        }),
    });
    const filterViews: IDashboardFilterView[] = ["First view", "Second view"].map((name, index) => ({
        name,
        ref: idRef(`view-${index}`),
        dashboard: idRef("dashboard"),
        user: idRef("user"),
        filterContext: { title: "", description: "", filters: [] },
    }));
    return render(
        <Provider store={store} context={ReactDashboardContext}>
            <IntlWrapper>
                <FilterViewsList filterViews={filterViews} onAddNew={() => {}} onClose={() => {}} />
            </IntlWrapper>
        </Provider>,
    );
}

describe("FilterViewsList", () => {
    it.each(["Cancel", "Close dialog"])(
        "returns focus to the activated Delete action after %s without prior DOM focus",
        async (closeAction) => {
            const user = userEvent.setup();
            renderList();
            const deleteButton = screen.getByRole("button", { name: "Delete Second view" });
            // Screen-reader activation can dispatch a click without moving DOM focus first.
            fireEvent.click(deleteButton);
            await user.click(await screen.findByRole("button", { name: closeAction }));
            await waitFor(() => expect(deleteButton).toHaveFocus());
            expect(deleteButton).toHaveAttribute("tabindex", "0");
            await user.keyboard("{ArrowLeft}");
            expect(screen.getByRole("button", { name: "Set Second view as default" })).toHaveFocus();
            await waitFor(() =>
                expect(screen.queryByRole("tooltip", { name: "Delete" })).not.toBeInTheDocument(),
            );
        },
    );
    it("returns focus after keyboard cancellation and lets Tab leave without an orphan tooltip", async () => {
        const user = userEvent.setup();
        renderList();
        await user.tab();
        await user.keyboard("{ArrowRight}{ArrowRight}{Enter}");
        await user.click(await screen.findByRole("button", { name: "Cancel" }));
        await waitFor(() => expect(screen.getByRole("button", { name: "Delete First view" })).toHaveFocus());
        await user.tab();
        expect(screen.getByRole("button", { name: "Create view" })).toHaveFocus();
        await waitFor(() =>
            expect(screen.queryByRole("tooltip", { name: "Delete" })).not.toBeInTheDocument(),
        );
    });
});
