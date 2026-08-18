// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IListedDashboard, idRef, uriRef } from "@gooddata/sdk-model";

import { type IGenAIDashboardListItem } from "../../../types.js";
import {
    chatWindowSliceReducer,
    contextDashboardsLoadFailedAction,
    contextDashboardsLoadingAction,
    contextDashboardsPageLoadedAction,
    getInitialChatWindowState,
    setContextDashboardsAction,
} from "../chatWindowSlice.js";

function listed(id: string): IListedDashboard {
    return {
        ref: idRef(id, "analyticalDashboard"),
        identifier: id,
        uri: `/${id}`,
        title: id,
        description: "",
        created: "2026-01-01 00:00:00",
        updated: "2026-01-01 00:00:00",
        availability: "full",
        shareStatus: "public",
    };
}

function dashboard(id: string): IGenAIDashboardListItem {
    return { id, ref: idRef(id, "analyticalDashboard"), title: id };
}

describe("chatWindowSlice - context dashboards", () => {
    it("starts out empty and open-ended", () => {
        const state = getInitialChatWindowState().contextDashboards;

        expect(state).toEqual({ items: [], loadedPages: 0, hasNextPage: true, isLoading: false });
    });

    it("does not share the initial state between stores", () => {
        const first = getInitialChatWindowState().contextDashboards;
        const second = getInitialChatWindowState().contextDashboards;

        expect(first.items).not.toBe(second.items);
    });

    it("appends a loaded page and advances the page counter", () => {
        const loading = chatWindowSliceReducer(getInitialChatWindowState(), contextDashboardsLoadingAction());
        expect(loading.contextDashboards.isLoading).toBe(true);

        const state = chatWindowSliceReducer(
            loading,
            contextDashboardsPageLoadedAction({ items: [listed("a"), listed("b")], hasNextPage: true }),
        );

        expect(state.contextDashboards).toEqual({
            items: [dashboard("a"), dashboard("b")],
            loadedPages: 1,
            hasNextPage: true,
            isLoading: false,
        });
    });

    it("uses the uri when the dashboard is referenced by one", () => {
        const state = chatWindowSliceReducer(
            getInitialChatWindowState(),
            contextDashboardsPageLoadedAction({
                items: [{ ...listed("by-uri"), ref: uriRef("/gdc/md/obj/1") }],
                hasNextPage: false,
            }),
        );

        expect(state.contextDashboards.items).toEqual([
            { id: "/gdc/md/obj/1", ref: uriRef("/gdc/md/obj/1"), title: "by-uri" },
        ]);
    });

    it("skips duplicate dashboards within the same page", () => {
        const state = chatWindowSliceReducer(
            getInitialChatWindowState(),
            contextDashboardsPageLoadedAction({
                items: [listed("a"), listed("a"), listed("b")],
                hasNextPage: false,
            }),
        );

        expect(state.contextDashboards.items.map((item) => item.id)).toEqual(["a", "b"]);
    });

    it("skips dashboards already in the list when a page is loaded twice", () => {
        const first = chatWindowSliceReducer(
            getInitialChatWindowState(),
            contextDashboardsPageLoadedAction({ items: [listed("a"), listed("b")], hasNextPage: true }),
        );
        const second = chatWindowSliceReducer(
            first,
            contextDashboardsPageLoadedAction({
                items: [listed("b"), listed("c")],
                hasNextPage: false,
            }),
        );

        expect(second.contextDashboards.items.map((item) => item.id)).toEqual(["a", "b", "c"]);
        expect(second.contextDashboards.loadedPages).toBe(2);
        expect(second.contextDashboards.hasNextPage).toBe(false);
    });

    it("keeps pagination retryable when a load fails", () => {
        const loading = chatWindowSliceReducer(getInitialChatWindowState(), contextDashboardsLoadingAction());
        const state = chatWindowSliceReducer(loading, contextDashboardsLoadFailedAction());

        expect(state.contextDashboards.isLoading).toBe(false);
        expect(state.contextDashboards.hasNextPage).toBe(true);
    });

    it("treats an externally supplied list as complete", () => {
        const state = chatWindowSliceReducer(
            getInitialChatWindowState(),
            setContextDashboardsAction({ items: [listed("a")] }),
        );

        expect(state.contextDashboards).toEqual({
            items: [dashboard("a")],
            loadedPages: 1,
            hasNextPage: false,
            isLoading: false,
        });
    });

    it("replaces the list when the externally supplied one changes", () => {
        const first = chatWindowSliceReducer(
            getInitialChatWindowState(),
            setContextDashboardsAction({ items: [listed("a")] }),
        );
        const second = chatWindowSliceReducer(first, setContextDashboardsAction({ items: [listed("b")] }));

        expect(second.contextDashboards.items.map((item) => item.id)).toEqual(["b"]);
    });
});
