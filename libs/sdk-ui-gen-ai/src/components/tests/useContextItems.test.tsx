// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { renderHook } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { type IGenAIUserContext, idRef } from "@gooddata/sdk-model";

import { chatWindowSliceName } from "../../store/chatWindow/chatWindowSlice.js";
import { type ContextDashboardsState, type IGenAIDashboardListItem } from "../../types.js";
import { useContextItems } from "../hooks/useContextItems.js";

const messages = { "gd.gen-ai.context.untitled": "Untitled" };

const ambientDashboardRef = idRef("ambient-dashboard", "analyticalDashboard");

const ambientContext: IGenAIUserContext = {
    view: {
        dashboard: {
            ref: ambientDashboardRef,
            title: "Revenue",
            widgets: [
                {
                    widgetType: "insight",
                    widgetRef: idRef("sales-by-region", "insight"),
                    title: "Sales by Region",
                },
            ],
        },
    },
};

function dashboard(id: string, title = id): IGenAIDashboardListItem {
    return { id, ref: idRef(id, "analyticalDashboard"), title };
}

function renderItems(
    items: IGenAIDashboardListItem[],
    {
        ambient = ambientContext,
        active,
        state,
    }: {
        ambient?: IGenAIUserContext;
        active?: IGenAIUserContext;
        state?: Partial<ContextDashboardsState>;
    } = {},
) {
    const storeState = {
        [chatWindowSliceName]: {
            contextDashboards: {
                items,
                loadedPages: 1,
                hasNextPage: false,
                isLoading: false,
                ...state,
            },
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
        ...renderHook(() => useContextItems(ambient, active), { wrapper }),
    };
}

describe("useContextItems", () => {
    it("offers the ambient dashboard and its widgets before the other dashboards", () => {
        const { result } = renderItems([dashboard("marketing", "Marketing")]);

        expect(result.current.items.map((item) => [item.type, item.title])).toEqual([
            ["dashboard", "Revenue"],
            ["widget", "Sales by Region"],
            ["dashboard", "Marketing"],
        ]);
    });

    it("does not offer the dashboard the user is viewing a second time", () => {
        const { result } = renderItems([
            dashboard("ambient-dashboard", "Revenue"),
            dashboard("marketing", "Marketing"),
        ]);

        expect(result.current.items.filter((item) => item.id === "ambient-dashboard")).toHaveLength(1);
    });

    it("marks a dashboard the user is not viewing as an explicit reference", () => {
        const { result } = renderItems([dashboard("marketing", "Marketing")]);

        const marketing = result.current.items.find((item) => item.id === "marketing");
        expect(marketing).toMatchObject({ type: "dashboard", where: "referencedObjects" });
        expect(marketing?.context).toBeUndefined();
    });

    it("leaves out dashboards already pinned to the active context", () => {
        const active: IGenAIUserContext = {
            referencedObjects: [
                {
                    objects: [
                        {
                            ref: idRef("marketing", "analyticalDashboard"),
                            title: "Marketing",
                            type: "DASHBOARD",
                        },
                    ],
                },
            ],
        };

        const { result } = renderItems(
            [dashboard("marketing", "Marketing"), dashboard("finance", "Finance")],
            { active },
        );

        expect(result.current.items.map((item) => item.id)).not.toContain("marketing");
        expect(result.current.items.map((item) => item.id)).toContain("finance");
    });

    it("falls back to the untitled label for a dashboard with no title", () => {
        const { result } = renderItems([dashboard("nameless", "")]);

        expect(result.current.items.find((item) => item.id === "nameless")?.title).toBe("Untitled");
    });

    it("passes the paging state through and asks for the next page on demand", () => {
        const { result, store } = renderItems([dashboard("marketing")], {
            state: { hasNextPage: true, isLoading: true },
        });

        expect(result.current.hasNextPage).toBe(true);
        expect(result.current.isLoading).toBe(true);

        result.current.loadNextPage();
        expect(store.dispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: "chatWindow/loadContextDashboardsNextPageAction" }),
        );
    });
});
