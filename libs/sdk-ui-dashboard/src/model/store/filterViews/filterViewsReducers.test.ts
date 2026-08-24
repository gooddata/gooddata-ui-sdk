// (C) 2026 GoodData Corporation

import { produce } from "immer";
import { describe, expect, it } from "vitest";

import { type IDashboardFilterView, idRef } from "@gooddata/sdk-model";

import { filterViewsReducers } from "./filterViewsReducers.js";
import { type IFilterViewsState } from "./filterViewsState.js";
import { filterViewsActions } from "./index.js";

const dashboard = idRef("dashboard", "analyticalDashboard");
const otherDashboard = idRef("otherDashboard", "analyticalDashboard");

const filterView = (id: string, isDefault = false): IDashboardFilterView => ({
    ref: idRef(id, "filterView"),
    name: id,
    dashboard,
    user: idRef("user"),
    filterContext: { title: id, description: "", filters: [] },
    isDefault,
});

const stateWith = (filterViews: IDashboardFilterView[], isLoading = false): IFilterViewsState => ({
    filterViews: [{ dashboard, filterViews }],
    isLoading,
});

const bucketOf = (state: IFilterViewsState, ref = dashboard) =>
    state.filterViews.find((item) => item.dashboard === ref)?.filterViews ?? [];

describe("filterViewsReducers", () => {
    describe("addFilterView", () => {
        it("appends to an empty state and clears loading", () => {
            const view = filterView("first");
            const result = produce({ filterViews: [], isLoading: true } as IFilterViewsState, (draft) =>
                filterViewsReducers.addFilterView(
                    draft,
                    filterViewsActions.addFilterView({ dashboard, filterView: view }),
                ),
            );

            expect(bucketOf(result)).toEqual([view]);
            expect(result.isLoading).toBe(false);
        });

        it("keeps the existing views of the dashboard", () => {
            const existing = filterView("existing");
            const added = filterView("added");
            const result = produce(stateWith([existing]), (draft) =>
                filterViewsReducers.addFilterView(
                    draft,
                    filterViewsActions.addFilterView({ dashboard, filterView: added }),
                ),
            );

            expect(bucketOf(result)).toEqual([added, existing]);
        });

        it("inserts the new view in the name order the list is loaded in", () => {
            const result = produce(stateWith([filterView("alpha"), filterView("charlie")]), (draft) =>
                filterViewsReducers.addFilterView(
                    draft,
                    filterViewsActions.addFilterView({ dashboard, filterView: filterView("bravo") }),
                ),
            );

            expect(bucketOf(result).map((item) => item.name)).toEqual(["alpha", "bravo", "charlie"]);
        });

        it("does not touch other dashboards", () => {
            const otherView = { ...filterView("other"), dashboard: otherDashboard };
            const initial: IFilterViewsState = {
                filterViews: [{ dashboard: otherDashboard, filterViews: [otherView] }],
                isLoading: false,
            };
            const result = produce(initial, (draft) =>
                filterViewsReducers.addFilterView(
                    draft,
                    filterViewsActions.addFilterView({ dashboard, filterView: filterView("mine") }),
                ),
            );

            expect(bucketOf(result, otherDashboard)).toEqual([otherView]);
        });

        it("replaces a view with the same ref instead of duplicating it", () => {
            const stale = filterView("same");
            const fresh = { ...filterView("same"), name: "renamed" };
            const result = produce(stateWith([stale]), (draft) =>
                filterViewsReducers.addFilterView(
                    draft,
                    filterViewsActions.addFilterView({ dashboard, filterView: fresh }),
                ),
            );

            expect(bucketOf(result)).toEqual([fresh]);
        });

        it("clears isDefault on the others when the new view is default", () => {
            const previousDefault = filterView("previous", true);
            const newDefault = filterView("new", true);
            const result = produce(stateWith([previousDefault]), (draft) =>
                filterViewsReducers.addFilterView(
                    draft,
                    filterViewsActions.addFilterView({ dashboard, filterView: newDefault }),
                ),
            );

            expect(bucketOf(result)).toEqual([newDefault, { ...previousDefault, isDefault: false }]);
        });

        it("leaves an existing default alone when the new view is not default", () => {
            const existingDefault = filterView("existing", true);
            const added = filterView("added");
            const result = produce(stateWith([existingDefault]), (draft) =>
                filterViewsReducers.addFilterView(
                    draft,
                    filterViewsActions.addFilterView({ dashboard, filterView: added }),
                ),
            );

            expect(bucketOf(result)).toEqual([added, existingDefault]);
        });
    });

    describe("removeFilterView", () => {
        it("drops only the given view and clears loading", () => {
            const kept = filterView("kept");
            const removed = filterView("removed");
            const result = produce(stateWith([kept, removed], true), (draft) =>
                filterViewsReducers.removeFilterView(
                    draft,
                    filterViewsActions.removeFilterView({ dashboard, ref: removed.ref }),
                ),
            );

            expect(bucketOf(result)).toEqual([kept]);
            expect(result.isLoading).toBe(false);
        });

        it("is a no-op for an unknown ref", () => {
            const kept = filterView("kept");
            const result = produce(stateWith([kept]), (draft) =>
                filterViewsReducers.removeFilterView(
                    draft,
                    filterViewsActions.removeFilterView({ dashboard, ref: idRef("nope", "filterView") }),
                ),
            );

            expect(bucketOf(result)).toEqual([kept]);
        });
    });

    describe("setFilterViewAsDefault", () => {
        it("moves the flag off the previous default", () => {
            const previous = filterView("previous", true);
            const target = filterView("target");
            const result = produce(stateWith([previous, target], true), (draft) =>
                filterViewsReducers.setFilterViewAsDefault(
                    draft,
                    filterViewsActions.setFilterViewAsDefault({
                        dashboard,
                        ref: target.ref,
                        isDefault: true,
                    }),
                ),
            );

            expect(bucketOf(result)).toEqual([
                { ...previous, isDefault: false },
                { ...target, isDefault: true },
            ]);
            expect(result.isLoading).toBe(false);
        });

        it("keeps the current default when the ref is unknown", () => {
            const current = filterView("current", true);
            const other = filterView("other");
            const result = produce(stateWith([current, other], true), (draft) =>
                filterViewsReducers.setFilterViewAsDefault(
                    draft,
                    filterViewsActions.setFilterViewAsDefault({
                        dashboard,
                        ref: idRef("nope", "filterView"),
                        isDefault: true,
                    }),
                ),
            );

            expect(bucketOf(result)).toEqual([current, other]);
            expect(result.isLoading).toBe(false);
        });

        it("unsets the flag without promoting anything else", () => {
            const current = filterView("current", true);
            const other = filterView("other");
            const result = produce(stateWith([current, other]), (draft) =>
                filterViewsReducers.setFilterViewAsDefault(
                    draft,
                    filterViewsActions.setFilterViewAsDefault({
                        dashboard,
                        ref: current.ref,
                        isDefault: false,
                    }),
                ),
            );

            expect(bucketOf(result)).toEqual([{ ...current, isDefault: false }, other]);
        });
    });
});
