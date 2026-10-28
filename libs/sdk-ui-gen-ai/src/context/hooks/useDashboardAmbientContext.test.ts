// (C) 2026 GoodData Corporation

import { createElement } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";
import { type DashboardSelectorEvaluator, selectFilterContextFilters } from "@gooddata/sdk-ui-dashboard";

import {
    chatWindowSliceName,
    chatWindowSliceReducer,
    getInitialChatWindowState,
    setSettingsAction,
} from "../../store/chatWindow/chatWindowSlice.js";

import { useDashboardAmbientContext } from "./useDashboardAmbientContext.js";

const filters = [
    {
        attributeFilter: {
            displayForm: idRef("region"),
            negativeSelection: false,
            attributeElements: { uris: ["/region/east"] },
            title: "Region",
        },
    },
] as never;

const dashboardState = {
    executionResults: {
        entities: {},
    },
};

const dashboardSelector: DashboardSelectorEvaluator = (selector) => {
    if (selector === selectFilterContextFilters) {
        return filters;
    }

    return selector(dashboardState as never);
};

const makeStore = () =>
    configureStore({
        reducer: {
            [chatWindowSliceName]: chatWindowSliceReducer,
        },
        preloadedState: {
            [chatWindowSliceName]: getInitialChatWindowState(),
        },
    });

const renderDashboardAmbientContext = (
    store: ReturnType<typeof makeStore>,
    selector?: DashboardSelectorEvaluator | null,
) =>
    renderHook(
        ({ selector }: { selector?: DashboardSelectorEvaluator | null }) =>
            useDashboardAmbientContext(selector),
        {
            initialProps: { selector },
            wrapper: ({ children }) => createElement(Provider, { store, children }),
        },
    );

const expectDashboardContext = (context: ReturnType<typeof getInitialChatWindowState>["context"]) => {
    const ambient = context.ambient;

    expect(ambient?.view?.dashboard?.ref).toEqual(idRef("new-dashboard", "analyticalDashboard"));
    expect(ambient?.view?.dashboard?.filters).toEqual([
        {
            type: "attribute_filter",
            using: "region",
            state: { include: ["/region/east"] },
            title: "Region",
        },
    ]);
    expect(context.active?.view?.dashboard).toEqual(ambient?.view?.dashboard);
};

describe("useDashboardAmbientContext", () => {
    it("sets ambient context when dashboard selector is provided", () => {
        const store = makeStore();
        store.dispatch(
            setSettingsAction({ settings: { enableAiContextSetup: true } as IUserWorkspaceSettings }),
        );

        renderDashboardAmbientContext(store, dashboardSelector);

        expectDashboardContext(store.getState().chatWindow.context);
    });

    it("does not dispatch context when dashboard selector is undefined", () => {
        const store = makeStore();

        renderDashboardAmbientContext(store, undefined);

        expect(store.getState().chatWindow.context.ambient).toBeUndefined();
    });

    it("clears ambient context when selector changes from value to undefined", () => {
        const store = makeStore();
        store.dispatch(
            setSettingsAction({ settings: { enableAiContextSetup: true } as IUserWorkspaceSettings }),
        );
        const { rerender } = renderDashboardAmbientContext(store, dashboardSelector);

        expectDashboardContext(store.getState().chatWindow.context);

        rerender({ selector: undefined });

        expect(store.getState().chatWindow.context.ambient).toBeUndefined();
    });

    it("clears ambient context when selector is explicitly null", () => {
        const store = makeStore();
        store.dispatch(
            setSettingsAction({ settings: { enableAiContextSetup: true } as IUserWorkspaceSettings }),
        );

        renderDashboardAmbientContext(store, null);

        expect(store.getState().chatWindow.context.ambient).toBeUndefined();
    });

    it("re-applies dashboard context when settings enable context setup after dashboard arrival", () => {
        const store = makeStore();
        renderDashboardAmbientContext(store, dashboardSelector);

        expect(store.getState().chatWindow.context.ambient).toBeUndefined();

        act(() => {
            store.dispatch(
                setSettingsAction({ settings: { enableAiContextSetup: true } as IUserWorkspaceSettings }),
            );
        });

        expectDashboardContext(store.getState().chatWindow.context);
    });

    it("re-applies dashboard context when disabled settings are later enabled", () => {
        const store = makeStore();
        store.dispatch(
            setSettingsAction({ settings: { enableAiContextSetup: false } as IUserWorkspaceSettings }),
        );
        renderDashboardAmbientContext(store, dashboardSelector);

        expect(store.getState().chatWindow.context.ambient).toBeUndefined();

        act(() => {
            store.dispatch(
                setSettingsAction({ settings: { enableAiContextSetup: true } as IUserWorkspaceSettings }),
            );
        });

        expectDashboardContext(store.getState().chatWindow.context);
    });

    it("does not restore stale dashboard context if the dashboard disappears before settings enable it", () => {
        const store = makeStore();
        const { rerender } = renderDashboardAmbientContext(store, dashboardSelector);

        rerender({ selector: undefined });

        act(() => {
            store.dispatch(
                setSettingsAction({ settings: { enableAiContextSetup: true } as IUserWorkspaceSettings }),
            );
        });

        expect(store.getState().chatWindow.context.ambient).toBeUndefined();
    });

    it("does not rebuild ambient context when unrelated settings change", () => {
        const store = makeStore();
        store.dispatch(
            setSettingsAction({ settings: { enableAiContextSetup: true } as IUserWorkspaceSettings }),
        );
        renderDashboardAmbientContext(store, dashboardSelector);
        const ambientContext = store.getState().chatWindow.context.ambient;

        act(() => {
            store.dispatch(
                setSettingsAction({
                    settings: {
                        enableAiContextSetup: true,
                        enableGenAiInteractionIntelligence: false,
                    } as IUserWorkspaceSettings,
                }),
            );
        });

        expect(store.getState().chatWindow.context.ambient).toBe(ambientContext);
    });
});
