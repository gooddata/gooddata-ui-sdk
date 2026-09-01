// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { renderHook } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { type IGenAIUserContext, idRef } from "@gooddata/sdk-model";

import { chatWindowSliceName } from "../store/chatWindow/chatWindowSlice.js";
import { type ContextObjectListState, type IGenAIContextListItem, type SelectedContext } from "../types.js";

import { useAmbientContextItems, useUserContextItems } from "./hooks/useContextItems.js";

// `isolate: false` shares one module graph per worker, so the modules imported above may already
// have been replaced by a sibling test file's `vi.mock()` earlier in the same worker (the context
// indicator and chooser suites mock react-redux). Dropping the module registry from `vi.hoisted()`
// (it runs before this file's own imports, unlike any `beforeEach`) makes those imports resolve
// through the real implementations again.
vi.hoisted(() => {
    vi.resetModules();
});

const messages = { "gd.gen-ai.context.untitled": "Untitled", "gd.gen-ai.context.this": "This dashboard" };

const ambientDashboardRef = idRef("ambient-dashboard", "analyticalDashboard");

const ambientContext: IGenAIUserContext = {
    view: {
        dashboard: {
            ref: ambientDashboardRef,
            title: "Revenue",
            widgets: [
                {
                    widgetType: "insight",
                    widgetRef: idRef("sales-widget", "insight"),
                    insightRef: idRef("sales-by-region", "insight"),
                    title: "Sales by Region",
                },
            ],
        },
    },
};

function dashboard(id: string, title = id): IGenAIContextListItem {
    return { id, ref: idRef(id, "analyticalDashboard"), title };
}

function visualization(id: string, title = id): IGenAIContextListItem {
    return { id, ref: idRef(id, "insight"), title };
}

function renderUserItems(
    items: IGenAIContextListItem[],
    {
        visualizations = [],
        ambient = ambientContext,
        selected,
        active,
        state,
        visualizationsState,
        search = "",
    }: {
        visualizations?: IGenAIContextListItem[];
        ambient?: IGenAIUserContext;
        selected?: SelectedContext;
        active?: IGenAIUserContext;
        state?: Partial<ContextObjectListState>;
        visualizationsState?: Partial<ContextObjectListState>;
        search?: string;
    } = {},
) {
    const storeState = {
        [chatWindowSliceName]: {
            contextObjects: {
                dashboard: {
                    items,
                    loadedPages: 1,
                    hasNextPage: false,
                    isLoading: false,
                    isExternal: false,
                    ...state,
                },
                visualization: {
                    items: visualizations,
                    loadedPages: 1,
                    hasNextPage: false,
                    isLoading: false,
                    isExternal: false,
                    ...visualizationsState,
                },
            },
            contextObjectsSearch: search,
        },
    };
    const store = {
        getState: () => storeState,
        subscribe: () => () => {},
        dispatch: vi.fn(),
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store as never}>
            <IntlProvider locale="en-US" messages={messages}>
                {children}
            </IntlProvider>
        </Provider>
    );

    return {
        store,
        ...renderHook(() => useUserContextItems(ambient, selected, active), { wrapper }),
    };
}

function renderAmbientItems(
    items: IGenAIContextListItem[],
    {
        visualizations = [],
        ambient = ambientContext,
        state,
        visualizationsState,
        search = "",
    }: {
        visualizations?: IGenAIContextListItem[];
        ambient?: IGenAIUserContext;
        state?: Partial<ContextObjectListState>;
        visualizationsState?: Partial<ContextObjectListState>;
        search?: string;
    } = {},
) {
    const storeState = {
        [chatWindowSliceName]: {
            contextObjects: {
                dashboard: {
                    items,
                    loadedPages: 1,
                    hasNextPage: false,
                    isLoading: false,
                    isExternal: false,
                    ...state,
                },
                visualization: {
                    items: visualizations,
                    loadedPages: 1,
                    hasNextPage: false,
                    isLoading: false,
                    isExternal: false,
                    ...visualizationsState,
                },
            },
            contextObjectsSearch: search,
            context: { active: undefined, ambient: ambient },
        },
    };
    const store = {
        getState: () => storeState,
        subscribe: () => () => {},
        dispatch: vi.fn(),
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store as never}>
            <IntlProvider locale="en-US" messages={messages}>
                {children}
            </IntlProvider>
        </Provider>
    );

    return {
        store,
        ...renderHook(() => useAmbientContextItems(ambient), { wrapper }),
    };
}

describe("useContextItems", () => {
    it("offers only the other dashboards and visualizations", () => {
        const { result } = renderUserItems([dashboard("marketing", "Marketing")], {
            visualizations: [visualization("orders", "Orders")],
        });

        expect(result.current.items.map((item) => [item.type, item.title])).toEqual([
            ["dashboard", "Marketing"],
            ["visualization", "Orders"],
        ]);
    });

    it("does not offer the dashboard the user is viewing a second time", () => {
        const { result } = renderUserItems([
            dashboard("ambient-dashboard", "Revenue"),
            dashboard("marketing", "Marketing"),
        ]);

        expect(result.current.items.filter((item) => item.id === "ambient-dashboard")).toHaveLength(0);
    });

    it("does not offer a visualization already rendered by a widget of the dashboard being viewed", () => {
        const { result } = renderUserItems([], {
            visualizations: [
                visualization("sales-by-region", "Sales by Region"),
                visualization("orders", "Orders"),
            ],
        });

        expect(result.current.items.map((item) => [item.type, item.title])).toEqual([
            ["visualization", "Orders"],
        ]);
    });

    it("does not offer a visualization rendered by a switcher of the dashboard being viewed", () => {
        const ambient: IGenAIUserContext = {
            view: {
                dashboard: {
                    ref: ambientDashboardRef,
                    title: "Revenue",
                    widgets: [
                        {
                            widgetType: "visualizationSwitcher",
                            widgetRef: idRef("switcher", "insight"),
                            title: "Switcher",
                            visualizations: [
                                {
                                    widgetType: "insight",
                                    widgetRef: idRef("child-widget", "insight"),
                                    insightRef: idRef("orders", "insight"),
                                    title: "Orders",
                                },
                            ],
                        },
                    ],
                },
            },
        };

        const { result } = renderUserItems([], {
            ambient,
            visualizations: [visualization("orders", "Orders"), visualization("costs", "Costs")],
        });

        expect(result.current.items.map((item) => [item.type, item.id])).toEqual([
            ["visualization", "costs"],
        ]);
    });

    it("marks a dashboard the user is not viewing as an explicit reference", () => {
        const { result } = renderUserItems([dashboard("marketing", "Marketing")]);

        const marketing = result.current.items.find((item) => item.id === "marketing");
        expect(marketing).toMatchObject({ type: "dashboard", where: "referencedObjects" });
        expect(marketing?.context).toBeUndefined();
    });

    it("leaves out objects already pinned to the active context", () => {
        const active: IGenAIUserContext = {
            referencedObjects: [
                {
                    objects: [
                        {
                            ref: idRef("marketing", "analyticalDashboard"),
                            title: "Marketing",
                            type: "DASHBOARD",
                        },
                        {
                            ref: idRef("orders", "insight"),
                            title: "Orders",
                            type: "WIDGET",
                        },
                    ],
                },
            ],
        };
        const selected: SelectedContext = {
            dashboard: {
                ref: idRef("marketing", "analyticalDashboard"),
                title: "Marketing",
                type: "dashboard",
                where: "view.dashboard",
                nesting: 0,
                id: "marketing",
            },
            visualization: {
                ref: idRef("orders", "insight"),
                title: "Orders",
                type: "widget",
                nesting: 1,
                id: "orders",
                where: "referencedObjects",
            },
        };

        const { result } = renderUserItems(
            [dashboard("marketing", "Marketing"), dashboard("finance", "Finance")],
            {
                visualizations: [visualization("orders", "Orders"), visualization("costs", "Costs")],
                active,
                selected,
            },
        );

        const offeredIds = result.current.items.map((item) => item.id);
        expect(offeredIds).not.toContain("marketing");
        expect(offeredIds).not.toContain("orders");
        expect(offeredIds).toContain("finance");
        expect(offeredIds).toContain("costs");
    });

    it("falls back to the untitled label for a dashboard with no title", () => {
        const { result } = renderUserItems([dashboard("nameless", "")]);

        expect(result.current.items.find((item) => item.id === "nameless")?.title).toBe("Untitled");
    });

    it("passes the paging state through and asks for the next page on demand", () => {
        const { result, store } = renderUserItems([dashboard("marketing")], {
            state: { hasNextPage: true, isLoading: true },
        });

        expect(result.current.hasNextPage).toBe(true);
        expect(result.current.isLoading).toBe(true);

        result.current.loadNextPage();
        expect(store.dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "chatWindow/loadContextObjectsNextPageAction",
                payload: { kind: "dashboard" },
            }),
        );
    });

    it("pages the visualizations once the dashboards run out", () => {
        const { result, store } = renderUserItems([dashboard("marketing")], {
            visualizationsState: { hasNextPage: true, isLoading: true },
        });

        expect(result.current.isLoading).toBe(true);

        result.current.loadNextPage();
        expect(store.dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "chatWindow/loadContextObjectsNextPageAction",
                payload: { kind: "visualization" },
            }),
        );
    });

    it("matches the ambient objects against the search itself - they were never queried", () => {
        const { result } = renderAmbientItems([], { search: "sales" });

        expect(result.current.items.map((item) => item.title)).toEqual(["Sales by Region"]);
    });

    it("leaves the searching of a paged list to the backend", () => {
        const { result } = renderUserItems([dashboard("marketing", "Marketing")], {
            search: "nothing alike",
        });

        expect(result.current.items.map((item) => item.id)).toContain("marketing");
    });

    it("matches a list handed in from the outside against the search itself", () => {
        const { result } = renderUserItems(
            [dashboard("marketing", "Marketing"), dashboard("finance", "Finance")],
            {
                state: { isExternal: true },
                search: "marketing",
            },
        );

        const offeredIds = result.current.items.map((item) => item.id);
        expect(offeredIds).toContain("marketing");
        expect(offeredIds).not.toContain("finance");
    });

    it("asks the store to search when told to", () => {
        const { result, store } = renderUserItems([dashboard("marketing")]);

        result.current.setSearch("revenue");

        expect(store.dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "chatWindow/setContextObjectsSearchAction",
                payload: { search: "revenue" },
            }),
        );
    });

    it("does not repeat a search it is already showing", () => {
        const { result, store } = renderUserItems([dashboard("marketing")], { search: "revenue" });

        result.current.setSearch("revenue");

        expect(store.dispatch).not.toHaveBeenCalled();
    });

    it("reports no next page and loads nothing once both lists are complete", () => {
        const { result, store } = renderUserItems([dashboard("marketing")]);

        expect(result.current.hasNextPage).toBe(false);

        result.current.loadNextPage();
        expect(store.dispatch).not.toHaveBeenCalled();
    });
});

describe("useAmbientContextItems", () => {
    it("offers the ambient dashboard and its widgets before the other dashboards", () => {
        const { result } = renderAmbientItems([dashboard("marketing", "Marketing")], {
            visualizations: [visualization("orders", "Orders")],
        });

        expect(result.current.items.map((item) => [item.type, item.title])).toEqual([
            ["dashboard", "This dashboard"],
            ["widget", "Sales by Region"],
        ]);
    });
});
