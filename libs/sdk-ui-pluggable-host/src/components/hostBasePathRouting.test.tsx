// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { BrowserRouter, useLocation, useNavigate } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { getHostBasePath, getHostPathname } from "../loader/hostBasePath.js";
import { getWorkspaceIdFromPath } from "../loader/routing.js";

import { useRedirectNavigation } from "./useRedirectNavigation.js";

function RouteProbe({ redirectTo }: { redirectTo?: string }) {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    useRedirectNavigation(
        redirectTo ? { state: "redirect", url: redirectTo } : { state: "loading" },
        navigate,
    );
    return (
        <div data-testid="route" data-workspace={getWorkspaceIdFromPath(pathname)}>
            {pathname}
        </div>
    );
}

function renderHostRouter(redirectTo?: string) {
    return render(
        <BrowserRouter basename={getHostBasePath() || "/"}>
            <RouteProbe redirectTo={redirectTo} />
        </BrowserRouter>,
    );
}

describe("host router with the page base path as basename", () => {
    afterEach(() => {
        window.history.replaceState(null, "", "/");
    });

    it.each([
        ["/ext/gdcn/embedded/workspace/ws1/dashboards/", "/embedded/workspace/ws1/dashboards/"],
        ["/ext/gdcn/workspace/ws1/analyze", "/workspace/ws1/analyze"],
        ["/workspace/ws1/analyze", "/workspace/ws1/analyze"],
    ])("routes %s as %s", (url, route) => {
        window.history.replaceState(null, "", url);

        renderHostRouter();

        expect(screen.getByTestId("route")).toHaveTextContent(route);
        expect(screen.getByTestId("route")).toHaveAttribute("data-workspace", "ws1");
    });

    it.each([
        "/ext/gdcn/embedded/workspace/ws1/dashboards/",
        "/ext/gdcn//embedded/workspace/ws1/dashboards/",
        "/ext/gdcn/",
    ])("sees the same route as the host helpers on %s", (url) => {
        window.history.replaceState(null, "", url);

        renderHostRouter();

        expect(screen.getByTestId("route").textContent).toBe(getHostPathname());
    });

    it.each([
        ["/ext/gdcn/workspace/ws1", "/workspace/ws1/analyze", "/ext/gdcn/workspace/ws1/analyze"],
        [
            "/ext/gdcn/embedded/workspace/ws1",
            "/embedded/workspace/ws1/dashboards",
            "/ext/gdcn/embedded/workspace/ws1/dashboards",
        ],
        ["/workspace/ws1", "/workspace/ws1/analyze", "/workspace/ws1/analyze"],
    ])("keeps the page under its base path when %s redirects to %s", (url, redirectTo, expected) => {
        window.history.replaceState(null, "", url);

        renderHostRouter(redirectTo);

        expect(window.location.pathname).toBe(expected);
        expect(screen.getByTestId("route")).toHaveTextContent(redirectTo);
    });

    it("agrees with the host helpers after navigating to a route without a known segment", () => {
        window.history.replaceState(null, "", "/ext/gdcn/workspace/ws1/analyze");

        renderHostRouter("/");

        expect(getHostBasePath()).toBe("/ext/gdcn");
        expect(screen.getByTestId("route").textContent).toBe("/");
        expect(getHostPathname()).toBe("/");
    });
});
