// (C) 2026 GoodData Corporation

import { type MouseEvent } from "react";

import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type PluggableApplicationRegistryItem } from "@gooddata/sdk-model";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

const { preloadMock } = vi.hoisted(() => ({ preloadMock: vi.fn() }));

vi.mock("../loader/pluggableApplicationsLoader.js", () => ({
    preloadPluggableApplication: preloadMock,
    getAppLifecycleCallbacks: vi.fn(),
    registerAppLifecycleCallbacks: vi.fn(),
}));

vi.mock("../loader/routing.js", () => ({
    getApplicationHref: (app: PluggableApplicationRegistryItem) => `/${app.id}`,
}));

import { PRELOAD_HOVER_INTENT_MS, useAppPreloadOnHover } from "./useAppPreloadOnHover.js";

const dashboards = { id: "dashboards", local: {} } as PluggableApplicationRegistryItem;
const metrics = { id: "metrics", local: {} } as PluggableApplicationRegistryItem;
const externalApp = { id: "docs", external: { url: "https://docs" } } as PluggableApplicationRegistryItem;

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
    return renderHook(() => useAppPreloadOnHover(apps, ctx, "/dashboards")).result;
}

describe("useAppPreloadOnHover", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        preloadMock.mockReset();
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = "";
    });

    it("preloads the application once the pointer has settled on its link", () => {
        const { current } = renderHandlers();

        current.onMouseOver(hoverEventOn("/dashboards"));
        expect(preloadMock).not.toHaveBeenCalled();

        vi.advanceTimersByTime(PRELOAD_HOVER_INTENT_MS);

        expect(preloadMock).toHaveBeenCalledExactlyOnceWith(dashboards);
    });

    it("preloads only the last link when the pointer sweeps across the header", () => {
        // The regression behind LX-2791: every link crossed on the way to the menu used to
        // start a full bundle download of its own.
        const { current } = renderHandlers();

        current.onMouseOver(hoverEventOn("/dashboards"));
        vi.advanceTimersByTime(PRELOAD_HOVER_INTENT_MS - 1);
        current.onMouseOver(hoverEventOn("/metrics"));
        vi.advanceTimersByTime(PRELOAD_HOVER_INTENT_MS);

        expect(preloadMock).toHaveBeenCalledExactlyOnceWith(metrics);
    });

    it("does not preload when the pointer leaves the header before settling", () => {
        const { current } = renderHandlers();

        current.onMouseOver(hoverEventOn("/dashboards"));
        current.onMouseLeave();
        vi.advanceTimersByTime(PRELOAD_HOVER_INTENT_MS * 10);

        expect(preloadMock).not.toHaveBeenCalled();
    });

    it("schedules each application at most once", () => {
        const { current } = renderHandlers();

        current.onMouseOver(hoverEventOn("/dashboards"));
        vi.advanceTimersByTime(PRELOAD_HOVER_INTENT_MS);
        current.onMouseOver(hoverEventOn("/dashboards"));
        vi.advanceTimersByTime(PRELOAD_HOVER_INTENT_MS);

        expect(preloadMock).toHaveBeenCalledOnce();
    });

    it.each([
        ["an unrelated header link", "/unrelated"],
        ["an external application", "/docs"],
    ])("cancels a pending preload when the pointer moves to %s", (_name, href) => {
        // The header's own onMouseLeave only fires once the pointer is out of the header
        // entirely, so moving from an application link onto the workspace picker or the help
        // menu used to leave the timer armed and preload an application never aimed at.
        const { current } = renderHandlers();

        current.onMouseOver(hoverEventOn("/dashboards"));
        current.onMouseOver(hoverEventOn(href));
        vi.advanceTimersByTime(PRELOAD_HOVER_INTENT_MS);

        expect(preloadMock).not.toHaveBeenCalled();
    });

    it("cancels a pending preload when the pointer moves onto a non-anchor header target", () => {
        const { current } = renderHandlers();

        current.onMouseOver(hoverEventOn("/dashboards"));
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

        current.onMouseOver(hoverEventOn("/docs"));
        vi.advanceTimersByTime(PRELOAD_HOVER_INTENT_MS);

        expect(preloadMock).not.toHaveBeenCalled();
    });

    it("drops a pending preload when the chrome unmounts", () => {
        const { result, unmount } = renderHook(() => useAppPreloadOnHover(apps, ctx, "/dashboards"));

        result.current.onMouseOver(hoverEventOn("/dashboards"));
        unmount();
        vi.advanceTimersByTime(PRELOAD_HOVER_INTENT_MS);

        expect(preloadMock).not.toHaveBeenCalled();
    });
});
