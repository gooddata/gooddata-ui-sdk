// (C) 2026 GoodData Corporation

import { type MouseEvent } from "react";

import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type PluggableApplicationRegistryItem } from "@gooddata/sdk-model";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { registerLocalApplicationLoaders } from "../loader/localLoader.js";
import { registerAppLifecycleCallbacks } from "../loader/pluggableApplicationsLoader.js";

import { PRELOAD_HOVER_INTENT_MS, useAppPreloadOnHover } from "./useAppPreloadOnHover.js";

// The real loader reports each preload through onPreloadStarted. A module mock would not work here:
// with isolation off, a test file that ran earlier in the worker can cache the real loader first.
const preloadMock = vi.fn();

function localApp(id: string): PluggableApplicationRegistryItem {
    return {
        apiVersion: "1.0",
        id,
        applicationScope: "organization",
        menuOrder: 1,
        title: id,
        local: { routeBase: `/${id}` },
    };
}

const dashboards = localApp("dashboards");
const metrics = localApp("metrics");
const externalApp = {
    apiVersion: "1.0",
    id: "docs",
    applicationScope: "organization",
    menuOrder: 3,
    title: "Docs",
    external: { url: "/organization/docs" },
} as PluggableApplicationRegistryItem;

const apps = [dashboards, metrics, externalApp];
const ctx = {} as IPlatformContext;

function hoverEventOn(href: string | null): MouseEvent<HTMLElement> {
    const anchor = document.createElement("a");
    if (href !== null) {
        anchor.setAttribute("href", href);
    }
    const target = document.createElement("span");
    anchor.appendChild(target);
    document.body.appendChild(anchor);

    return { target } as unknown as MouseEvent<HTMLElement>;
}

function renderHandlers() {
    return renderHook(() => useAppPreloadOnHover(apps, ctx, "/organization/dashboards")).result;
}

describe("useAppPreloadOnHover", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        preloadMock.mockReset();
        registerAppLifecycleCallbacks({ onPreloadStarted: preloadMock });
        registerLocalApplicationLoaders({
            dashboards: () => Promise.resolve({ pluggableApp: { mount: vi.fn() } }),
            metrics: () => Promise.resolve({ pluggableApp: { mount: vi.fn() } }),
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = "";
        registerAppLifecycleCallbacks({});
        registerLocalApplicationLoaders({});
    });

    it("preloads the application once the pointer has settled on its link", () => {
        const { current } = renderHandlers();

        current.onMouseOver(hoverEventOn("/organization/dashboards"));
        expect(preloadMock).not.toHaveBeenCalled();

        vi.advanceTimersByTime(PRELOAD_HOVER_INTENT_MS);

        expect(preloadMock).toHaveBeenCalledExactlyOnceWith("dashboards");
    });

    it("preloads only the last link when the pointer sweeps across the header", () => {
        // The regression behind LX-2791: every link crossed on the way to the menu used to
        // start a full bundle download of its own.
        const { current } = renderHandlers();

        current.onMouseOver(hoverEventOn("/organization/dashboards"));
        vi.advanceTimersByTime(PRELOAD_HOVER_INTENT_MS - 1);
        current.onMouseOver(hoverEventOn("/organization/metrics"));
        vi.advanceTimersByTime(PRELOAD_HOVER_INTENT_MS);

        expect(preloadMock).toHaveBeenCalledExactlyOnceWith("metrics");
    });

    it("does not preload when the pointer leaves the header before settling", () => {
        const { current } = renderHandlers();

        current.onMouseOver(hoverEventOn("/organization/dashboards"));
        current.onMouseLeave();
        vi.advanceTimersByTime(PRELOAD_HOVER_INTENT_MS * 10);

        expect(preloadMock).not.toHaveBeenCalled();
    });

    it("schedules each application at most once", () => {
        const { current } = renderHandlers();

        current.onMouseOver(hoverEventOn("/organization/dashboards"));
        vi.advanceTimersByTime(PRELOAD_HOVER_INTENT_MS);
        current.onMouseOver(hoverEventOn("/organization/dashboards"));
        vi.advanceTimersByTime(PRELOAD_HOVER_INTENT_MS);

        expect(preloadMock).toHaveBeenCalledOnce();
    });

    it.each([
        ["an unrelated header link", "/unrelated"],
        ["an external application", "/organization/docs"],
    ])("cancels a pending preload when the pointer moves to %s", (_name, href) => {
        // The header's own onMouseLeave only fires once the pointer is out of the header
        // entirely, so moving from an application link onto the workspace picker or the help
        // menu used to leave the timer armed and preload an application never aimed at.
        const { current } = renderHandlers();

        current.onMouseOver(hoverEventOn("/organization/dashboards"));
        current.onMouseOver(hoverEventOn(href));
        vi.advanceTimersByTime(PRELOAD_HOVER_INTENT_MS);

        expect(preloadMock).not.toHaveBeenCalled();
    });

    it("cancels a pending preload when the pointer moves onto a non-anchor header target", () => {
        const { current } = renderHandlers();

        current.onMouseOver(hoverEventOn("/organization/dashboards"));
        current.onMouseOver({
            target: document.createElement("div"),
        } as unknown as MouseEvent<HTMLElement>);
        vi.advanceTimersByTime(PRELOAD_HOVER_INTENT_MS);

        expect(preloadMock).not.toHaveBeenCalled();
    });

    it("ignores hovers that do not land on an application link", () => {
        const { current } = renderHandlers();

        current.onMouseOver(hoverEventOn("/unrelated"));
        current.onMouseOver(hoverEventOn(null));
        vi.advanceTimersByTime(PRELOAD_HOVER_INTENT_MS);

        expect(preloadMock).not.toHaveBeenCalled();
    });

    it("never preloads an external application — there is no bundle to warm", () => {
        const { current } = renderHandlers();

        current.onMouseOver(hoverEventOn("/organization/docs"));
        vi.advanceTimersByTime(PRELOAD_HOVER_INTENT_MS);

        expect(preloadMock).not.toHaveBeenCalled();
    });

    it("drops a pending preload when the chrome unmounts", () => {
        const { result, unmount } = renderHook(() =>
            useAppPreloadOnHover(apps, ctx, "/organization/dashboards"),
        );

        result.current.onMouseOver(hoverEventOn("/organization/dashboards"));
        unmount();
        vi.advanceTimersByTime(PRELOAD_HOVER_INTENT_MS);

        expect(preloadMock).not.toHaveBeenCalled();
    });
});
