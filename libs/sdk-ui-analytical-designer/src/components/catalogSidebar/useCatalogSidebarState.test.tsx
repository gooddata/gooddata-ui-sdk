// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { act, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { legacy_createStore as createStore } from "redux";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { initialState } from "../../reducers/initial_state.js";
import { type IAppState } from "../../store/types.js";
import { withRouteQuery } from "../../tests/route.test.helpers.js";
import { withMeta, withRoot } from "../../tests/state_builder.test.helpers.js";

import { useCatalogSidebarState } from "./useCatalogSidebarState.js";

function makeWrapper(state: IAppState) {
    const store = createStore((current: IAppState = state) => current);

    function Wrapper({ children }: PropsWithChildren) {
        return <Provider store={store}>{children}</Provider>;
    }

    return Wrapper;
}

const enabledState = withRoot(initialState, { featureFlags: { enableCollapsibleLeftSidebar: true } });

describe("useCatalogSidebarState", () => {
    const innerWidth = Object.getOwnPropertyDescriptor(window, "innerWidth");

    beforeEach(() => {
        Object.defineProperty(window, "innerWidth", { configurable: true, value: 1920 });
    });

    afterEach(() => {
        if (innerWidth) {
            Object.defineProperty(window, "innerWidth", innerWidth);
        }
        window.localStorage.clear();
    });

    it("keeps the catalog fixed at the default width without the setting", () => {
        const { result } = renderHook(() => useCatalogSidebarState(), { wrapper: makeWrapper(initialState) });

        expect(result.current.width).toBe(230);
        expect(result.current.canResize).toBe(false);
        expect(result.current.canCollapse).toBe(false);
    });

    it("makes the catalog resizable and collapsible with the setting", () => {
        const { result } = renderHook(() => useCatalogSidebarState(), { wrapper: makeWrapper(enabledState) });

        expect(result.current.canResize).toBe(true);
        expect(result.current.canCollapse).toBe(true);
        expect(result.current.min).toBe(230);
        expect(result.current.max).toBe(500);
    });

    it("leaves room for the buckets panel and the minimum canvas", () => {
        Object.defineProperty(window, "innerWidth", { configurable: true, value: 1280 });

        const { result } = renderHook(() => useCatalogSidebarState(), { wrapper: makeWrapper(enabledState) });

        expect(result.current.max).toBe(320);
    });

    it("leaves that room within the editor when the host takes part of the window", () => {
        const { result } = renderHook(() => useCatalogSidebarState(1200), {
            wrapper: makeWrapper(enabledState),
        });

        expect(result.current.max).toBe(240);
    });

    it("only resizes when the top bar with the restore control is hidden", () => {
        const topBarHiddenState = withMeta(withRouteQuery(enabledState, { hideControl: "[topBar]" }), {
            isEmbedded: true,
        });

        const { result } = renderHook(() => useCatalogSidebarState(), {
            wrapper: makeWrapper(topBarHiddenState),
        });

        expect(result.current.canResize).toBe(true);
        expect(result.current.canCollapse).toBe(false);
    });

    it("hides the catalog completely and restores the expanded width", () => {
        const { result } = renderHook(() => useCatalogSidebarState(), { wrapper: makeWrapper(enabledState) });

        act(() => result.current.setWidth(320));
        act(() => result.current.setCollapsed(true));

        expect(result.current.isCollapsed).toBe(true);
        expect(result.current.width).toBe(0);
        expect(result.current.expandedWidth).toBe(320);

        act(() => result.current.setCollapsed(false));

        expect(result.current.width).toBe(320);
    });
});
