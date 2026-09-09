// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { mapBareLegacyPathToApp, mapLegacyUrlToHost } from "./legacyRedirect.js";

function location(pathname: string, hash = "", search = "") {
    return { pathname, hash, search };
}

describe("mapLegacyUrlToHost", () => {
    it.each([
        ["/dashboards/", "#/workspace/ws1/dashboard/d1", "/workspace/ws1/dashboards/#/dashboard/d1"],
        ["/dashboards/", "#/project/ws1", "/workspace/ws1/dashboards/"],
        ["/dashboards/embedded/", "#/client/ws1/x", "/embedded/workspace/ws1/dashboards/#/x"],
        ["/analyze/", "#/ws1/insight1", "/workspace/ws1/analyze/#/insight1"],
        ["/analyze/embedded/", "#/ws1", "/embedded/workspace/ws1/analyze/"],
        ["/metrics", "#/ws1/metric/m1", "/workspace/ws1/metrics/metric/m1"],
        ["/modeler", "#/ws1", "/workspace/ws1/modeler"],
        ["/modeler", "#/ws1?displayEditMode", "/workspace/ws1/modeler?displayEditMode"],
    ])("maps %s%s to %s", (pathname, hash, expected) => {
        expect(mapLegacyUrlToHost(location(pathname, hash))).toBe(expected);
    });

    it.each([
        ["/workspaces", "/organization/settings/workspaces"],
        ["/workspaces/ws1", "/organization/settings/workspaces/ws1"],
        ["/workspaces/ws1/configuration", "/organization/settings/workspaces/ws1/configuration"],
        ["/data-sources", "/organization/settings/data-sources"],
        ["/users-and-groups", "/organization/settings/users-and-groups"],
        ["/settings", "/organization/settings/settings"],
        ["/configuration", "/organization/settings/configuration"],
        ["/automations", "/organization/settings/automations"],
        ["/ai-hub/agents/a1", "/organization/settings/ai-hub/agents/a1"],
        ["/getting-started", "/organization/settings/getting-started"],
    ])("maps the legacy home-ui path %s to %s", (pathname, expected) => {
        expect(mapLegacyUrlToHost(location(pathname))).toBe(expected);
    });

    it.each([
        ["/workspaces/ws1/catalog", "/organization/settings/workspaces/ws1/catalog"],
        ["/workspaces/ws1/catalog/objects", "/organization/settings/workspaces/ws1/catalog/objects"],
        ["/workspaces/ws1/catalog/ai-memory", "/organization/settings/workspaces/ws1/catalog/ai-memory"],
    ])(
        "leaves the legacy catalog path %s on the home-ui module, which gates the handoff",
        (pathname, expected) => {
            expect(mapLegacyUrlToHost(location(pathname))).toBe(expected);
        },
    );

    it.each([
        ["/settings", "#ai", "/organization/settings/ai-hub#ai"],
        ["/settings", "#ai/create-llm-provider", "/organization/settings/ai-hub#ai/create-llm-provider"],
        ["/settings/", "#ai", "/organization/settings/ai-hub#ai"],
    ])("resolves the AI Hub deeplink %s%s to %s", (pathname, hash, expected) => {
        expect(mapLegacyUrlToHost(location(pathname, hash))).toBe(expected);
    });

    it("leaves a non-AI hash on /settings alone", () => {
        expect(mapLegacyUrlToHost(location("/settings", "#aircraft"))).toBe(
            "/organization/settings/settings#aircraft",
        );
    });

    it("keeps the query string and hash of a legacy home-ui path", () => {
        expect(mapLegacyUrlToHost(location("/workspaces", "#anchor", "?tab=a"))).toBe(
            "/organization/settings/workspaces?tab=a#anchor",
        );
    });

    it.each([
        "/",
        "/organization/settings/workspaces",
        "/workspace/ws1/catalog",
        "/settings-of-something-else",
        "/api/v1/entities",
    ])("leaves %s alone", (pathname) => {
        expect(mapLegacyUrlToHost(location(pathname))).toBeNull();
    });
});

describe("mapBareLegacyPathToApp", () => {
    it.each([
        ["/dashboards", "/dashboards"],
        ["/analyze/", "/analyze"],
        ["/metrics", "/metrics"],
        ["/modeler", "/modeler"],
    ])("maps the bare legacy path %s to %s", (pathname, expected) => {
        expect(mapBareLegacyPathToApp(pathname)).toBe(expected);
    });

    it("returns null for a path that is not a bare legacy app landing", () => {
        expect(mapBareLegacyPathToApp("/workspaces")).toBeNull();
    });
});
