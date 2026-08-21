// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { type IHostNavigationRequest } from "@gooddata/sdk-pluggable-application-model";

import { isSameDestination, runGuardedNavigation } from "../navigationGuard.js";

type Guard = (request: IHostNavigationRequest) => boolean;

describe("isSameDestination", () => {
    it.each([
        ["the pathnames are identical", "/workspace/ws1/analyze", "/workspace/ws1/analyze"],
        ["only a trailing slash differs", "/workspace/ws1/analyze/", "/workspace/ws1/analyze"],
        ["the target adds a search string", "/workspace/ws1/analyze?tab=1", "/workspace/ws1/analyze"],
        ["the target adds a hash", "/workspace/ws1/analyze#/abc/edit", "/workspace/ws1/analyze"],
        ["only the embedded prefix differs", "/embedded/workspace/ws1/analyze", "/workspace/ws1/analyze"],
    ])("treats the target as the current destination when %s", (_case, targetUrl, currentPathname) => {
        expect(isSameDestination(targetUrl, currentPathname)).toBe(true);
    });

    it.each([
        ["another application", "/workspace/ws1/dashboards", "/workspace/ws1/analyze"],
        ["another workspace", "/workspace/ws2/analyze", "/workspace/ws1/analyze"],
        ["a nested route of the same application", "/workspace/ws1/analyze/x", "/workspace/ws1/analyze"],
    ])(
        "treats the target as a different destination when it points to %s",
        (_case, targetUrl, currentPathname) => {
            expect(isSameDestination(targetUrl, currentPathname)).toBe(false);
        },
    );
});

describe("runGuardedNavigation", () => {
    const CURRENT = "/workspace/ws1/analyze";
    const TARGET = "/workspace/ws2/analyze";

    it("navigates immediately when no application registered a guard", () => {
        const navigate = vi.fn();

        runGuardedNavigation({
            url: TARGET,
            currentPathname: CURRENT,
            guardRef: { current: undefined },
            navigate,
        });

        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(TARGET);
    });

    it("navigates immediately when the guard declines to block", () => {
        const navigate = vi.fn();
        const guard = vi.fn().mockReturnValue(false);

        runGuardedNavigation({
            url: TARGET,
            currentPathname: CURRENT,
            guardRef: { current: guard },
            navigate,
        });

        expect(guard).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(TARGET);
    });

    it("defers the navigation while the guard blocks it", () => {
        const navigate = vi.fn();
        const guard = vi.fn().mockReturnValue(true);

        runGuardedNavigation({
            url: TARGET,
            currentPathname: CURRENT,
            guardRef: { current: guard },
            navigate,
        });

        expect(navigate).not.toHaveBeenCalled();
    });

    it("navigates to the original url once a blocking guard calls proceed", () => {
        const navigate = vi.fn();
        let captured: IHostNavigationRequest | undefined;
        const guard: Guard = (request) => {
            captured = request;
            return true;
        };

        runGuardedNavigation({
            url: TARGET,
            currentPathname: CURRENT,
            guardRef: { current: guard },
            navigate,
        });
        expect(navigate).not.toHaveBeenCalled();

        captured?.proceed();

        expect(captured?.url).toBe(TARGET);
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(TARGET);
    });

    it("skips the guard entirely when the target is the pathname already open", () => {
        const navigate = vi.fn();
        const guard = vi.fn().mockReturnValue(true);

        runGuardedNavigation({
            url: CURRENT,
            currentPathname: CURRENT,
            guardRef: { current: guard },
            navigate,
        });

        expect(guard).not.toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(CURRENT);
    });

    it("navigates only once when proceed is called repeatedly", () => {
        const navigate = vi.fn();
        let captured: IHostNavigationRequest | undefined;
        const guard: Guard = (request) => {
            captured = request;
            return true;
        };

        runGuardedNavigation({
            url: TARGET,
            currentPathname: CURRENT,
            guardRef: { current: guard },
            navigate,
        });

        captured?.proceed();
        captured?.proceed();

        expect(navigate).toHaveBeenCalledTimes(1);
    });

    it("ignores proceed once the registered guard has been replaced", () => {
        const navigate = vi.fn();
        let captured: IHostNavigationRequest | undefined;
        const guard: Guard = (request) => {
            captured = request;
            return true;
        };
        const guardRef: { current: Guard | undefined } = { current: guard };

        runGuardedNavigation({ url: TARGET, currentPathname: CURRENT, guardRef, navigate });

        guardRef.current = vi.fn().mockReturnValue(false);
        captured?.proceed();

        expect(navigate).not.toHaveBeenCalled();
    });

    it("ignores proceed once the registered guard has been removed", () => {
        const navigate = vi.fn();
        let captured: IHostNavigationRequest | undefined;
        const guard: Guard = (request) => {
            captured = request;
            return true;
        };
        const guardRef: { current: Guard | undefined } = { current: guard };

        runGuardedNavigation({ url: TARGET, currentPathname: CURRENT, guardRef, navigate });

        guardRef.current = undefined;
        captured?.proceed();

        expect(navigate).not.toHaveBeenCalled();
    });
});
