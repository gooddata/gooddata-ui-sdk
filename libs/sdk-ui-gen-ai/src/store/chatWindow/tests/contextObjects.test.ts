// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef, uriRef } from "@gooddata/sdk-model";

import { type IGenAIContextListItem } from "../../../types.js";
import {
    chatWindowSliceReducer,
    contextObjectsLoadFailedAction,
    contextObjectsLoadingAction,
    contextObjectsPageLoadedAction,
    getInitialChatWindowState,
    setContextObjectsAction,
} from "../chatWindowSlice.js";

function dashboard(id: string): IGenAIContextListItem {
    return { id, ref: idRef(id, "analyticalDashboard"), title: id };
}

describe("chatWindowSlice - context objects", () => {
    it("starts out empty and open-ended", () => {
        const state = getInitialChatWindowState().contextObjects;

        expect(state.dashboard).toEqual({ items: [], loadedPages: 0, hasNextPage: true, isLoading: false });
        expect(state.visualization).toEqual({
            items: [],
            loadedPages: 0,
            hasNextPage: true,
            isLoading: false,
        });
    });

    it("does not share the initial state between stores", () => {
        const first = getInitialChatWindowState().contextObjects;
        const second = getInitialChatWindowState().contextObjects;

        expect(first.dashboard.items).not.toBe(second.dashboard.items);
    });

    it("appends a loaded page and advances the page counter", () => {
        const loading = chatWindowSliceReducer(
            getInitialChatWindowState(),
            contextObjectsLoadingAction({ kind: "dashboard" }),
        );
        expect(loading.contextObjects.dashboard.isLoading).toBe(true);

        const state = chatWindowSliceReducer(
            loading,
            contextObjectsPageLoadedAction({
                kind: "dashboard",
                items: [dashboard("a"), dashboard("b")],
                hasNextPage: true,
            }),
        );

        expect(state.contextObjects.dashboard).toEqual({
            items: [dashboard("a"), dashboard("b")],
            loadedPages: 1,
            hasNextPage: true,
            isLoading: false,
        });
    });

    it("pages each kind on its own", () => {
        const dashboards = chatWindowSliceReducer(
            getInitialChatWindowState(),
            contextObjectsPageLoadedAction({
                kind: "dashboard",
                items: [dashboard("a")],
                hasNextPage: false,
            }),
        );
        const state = chatWindowSliceReducer(
            dashboards,
            contextObjectsPageLoadedAction({
                kind: "visualization",
                items: [dashboard("b")],
                hasNextPage: true,
            }),
        );

        expect(state.contextObjects.dashboard).toMatchObject({
            items: [dashboard("a")],
            hasNextPage: false,
        });
        expect(state.contextObjects.visualization).toMatchObject({
            items: [dashboard("b")],
            hasNextPage: true,
        });
    });

    it("uses the uri when the object is referenced by one", () => {
        const byUri = { id: "/gdc/md/obj/1", ref: uriRef("/gdc/md/obj/1"), title: "by-uri" };
        const state = chatWindowSliceReducer(
            getInitialChatWindowState(),
            contextObjectsPageLoadedAction({ kind: "dashboard", items: [byUri], hasNextPage: false }),
        );

        expect(state.contextObjects.dashboard.items).toEqual([byUri]);
    });

    it("skips duplicate objects within the same page", () => {
        const state = chatWindowSliceReducer(
            getInitialChatWindowState(),
            contextObjectsPageLoadedAction({
                kind: "dashboard",
                items: [dashboard("a"), dashboard("a"), dashboard("b")],
                hasNextPage: false,
            }),
        );

        expect(state.contextObjects.dashboard.items.map((item) => item.id)).toEqual(["a", "b"]);
    });

    it("skips objects already in the list when a page is loaded twice", () => {
        const first = chatWindowSliceReducer(
            getInitialChatWindowState(),
            contextObjectsPageLoadedAction({
                kind: "dashboard",
                items: [dashboard("a"), dashboard("b")],
                hasNextPage: true,
            }),
        );
        const second = chatWindowSliceReducer(
            first,
            contextObjectsPageLoadedAction({
                kind: "dashboard",
                items: [dashboard("b"), dashboard("c")],
                hasNextPage: false,
            }),
        );

        expect(second.contextObjects.dashboard.items.map((item) => item.id)).toEqual(["a", "b", "c"]);
        expect(second.contextObjects.dashboard.loadedPages).toBe(2);
        expect(second.contextObjects.dashboard.hasNextPage).toBe(false);
    });

    it("keeps pagination retryable when a load fails", () => {
        const loading = chatWindowSliceReducer(
            getInitialChatWindowState(),
            contextObjectsLoadingAction({ kind: "dashboard" }),
        );
        const state = chatWindowSliceReducer(loading, contextObjectsLoadFailedAction({ kind: "dashboard" }));

        expect(state.contextObjects.dashboard.isLoading).toBe(false);
        expect(state.contextObjects.dashboard.hasNextPage).toBe(true);
    });

    it("treats an externally supplied list as complete", () => {
        const state = chatWindowSliceReducer(
            getInitialChatWindowState(),
            setContextObjectsAction({ kind: "dashboard", items: [dashboard("a")] }),
        );

        expect(state.contextObjects.dashboard).toEqual({
            items: [dashboard("a")],
            loadedPages: 1,
            hasNextPage: false,
            isLoading: false,
        });
    });

    it("replaces the list when the externally supplied one changes", () => {
        const first = chatWindowSliceReducer(
            getInitialChatWindowState(),
            setContextObjectsAction({ kind: "dashboard", items: [dashboard("a")] }),
        );
        const second = chatWindowSliceReducer(
            first,
            setContextObjectsAction({ kind: "dashboard", items: [dashboard("b")] }),
        );

        expect(second.contextObjects.dashboard.items.map((item) => item.id)).toEqual(["b"]);
    });
});
