// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { mapBareLegacyPathToApp, mapLegacyUrlToHost } from "./legacyRedirect.js";

function location(pathname: string, hash = "", search = "") {
    return { pathname, hash, search };
}

describe("mapLegacyUrlToHost", () => {
    it.each([
        [
            "/workspace/ws1/reports/report/r%2F1",
            "?mode=export_slideshow&pageWidth=1920",
            "/workspace/ws1/publisher/report/r%2F1?mode=export_slideshow&pageWidth=1920",
        ],
        ["/workspace/ws1/reports", "", "/workspace/ws1/publisher"],
        ["/workspace/ws1/reports/templates", "", "/workspace/ws1/publisher/templates"],
        ["/embedded/workspace/ws1/reports/layouts", "", "/embedded/workspace/ws1/publisher/layouts"],
    ])("maps the former Publisher route %s%s to %s", (pathname, search, expected) => {
        expect(mapLegacyUrlToHost(location(pathname, "", search))).toBe(expected);
    });

    it.each(["/workspace/ws1/reportsx", "/workspace/ws1/publisher/report/r1", "/reports"])(
        "leaves %s alone",
        (pathname) => {
            expect(mapLegacyUrlToHost(location(pathname))).toBeNull();
        },
    );

    it.each([
        ["/analyze/", "#/ws1/insight1", "/workspace/ws1/analyze/#/insight1"],
        ["/analyze/embedded/", "#/ws1", "/embedded/workspace/ws1/analyze/"],
        ["/metrics", "#/ws1/metric/m1", "/workspace/ws1/metrics/metric/m1"],
        ["/modeler", "#/ws1", "/workspace/ws1/modeler"],
        ["/modeler", "#/ws1?displayEditMode", "/workspace/ws1/modeler?displayEditMode"],
    ])("maps %s%s to %s", (pathname, hash, expected) => {
        expect(mapLegacyUrlToHost(location(pathname, hash))).toBe(expected);
    });

    it.each([
        ["#/workspace/ws1/dashboard/d1", "", "/workspace/ws1/dashboards/#/dashboard/d1"],
        ["#/workspace/ws1/dashboard/d1/tab/t1", "", "/workspace/ws1/dashboards/#/dashboard/d1/tab/t1"],
        ["#/workspace/ws1/dashboardId/d1", "", "/workspace/ws1/dashboards/#/dashboardId/d1"],
        ["#/workspace/ws1/new-dashboard", "", "/workspace/ws1/dashboards/#/new-dashboard"],
        ["#/workspace/ws1/new-dashboard-edit", "", "/workspace/ws1/dashboards/#/new-dashboard-edit"],
        ["#/workspace/ws1", "", "/workspace/ws1/dashboards/"],
        ["#/workspace/ws1?x=1", "", "/workspace/ws1/dashboards/#?x=1"],
        ["#/project/ws1", "", "/workspace/ws1/dashboards/"],
        ["#/project/ws1/dashboard/d1/tab/t1", "", "/workspace/ws1/dashboards/#/dashboard/d1/tab/t1"],
        ["#/p/ws1/dashboard/d1", "", "/workspace/ws1/dashboards/#/dashboard/d1"],
        ["#/p/ws1/dashboard/d1/tab/t1", "", "/workspace/ws1/dashboards/#/dashboard/d1/tab/t1"],
        ["#/p/ws1/new-dashboard", "", "/workspace/ws1/dashboards/#/new-dashboard"],
        ["#/workspace/ws1/dashboard/d1", "?locale=en", "/workspace/ws1/dashboards/?locale=en#/dashboard/d1"],
        ["#/workspace/client/dashboard/d1", "", "/workspace/client/dashboards/#/dashboard/d1"],
    ])("maps the legacy KD URL /dashboards/%s (search %s) to %s", (hash, search, expected) => {
        expect(mapLegacyUrlToHost(location("/dashboards/", hash, search))).toBe(expected);
    });

    it.each([
        [
            "PDF export",
            "#/workspace/ws1/dashboard/d1?displayMode=export&exportId=e1",
            "",
            "/workspace/ws1/dashboards/#/dashboard/d1?displayMode=export&exportId=e1",
        ],
        [
            "PDF export in the query string",
            "#/workspace/ws1/dashboard/d1",
            "?displayMode=export&exportId=e1",
            "/workspace/ws1/dashboards/?displayMode=export&exportId=e1#/dashboard/d1",
        ],
        [
            "slides export",
            "#/workspace/ws1/dashboard/d1?mode=export&initialContent=%7B%22a%22%3A1%7D&widgetId=w1&exportId=e1&slideWidth=1920&slideHeight=1080",
            "",
            "/workspace/ws1/dashboards/#/dashboard/d1?mode=export&initialContent=%7B%22a%22%3A1%7D&widgetId=w1&exportId=e1&slideWidth=1920&slideHeight=1080",
        ],
        [
            "automation link",
            "#/workspace/ws1/dashboard/d1?automationId=a1&asOfDate=2026-10-26T10%3A00%3A00Z",
            "",
            "/workspace/ws1/dashboards/#/dashboard/d1?automationId=a1&asOfDate=2026-10-26T10%3A00%3A00Z",
        ],
        [
            "AI builder draft",
            "#/workspace/ws1/dashboard/d1?aibuilder=v1",
            "",
            "/workspace/ws1/dashboards/#/dashboard/d1?aibuilder=v1",
        ],
        [
            "AI builder new dashboard draft",
            "#/workspace/ws1/new-dashboard/?aibuilder=v1",
            "",
            "/workspace/ws1/dashboards/#/new-dashboard/?aibuilder=v1",
        ],
    ])("keeps the query of a legacy KD %s byte for byte", (_name, hash, search, expected) => {
        expect(mapLegacyUrlToHost(location("/dashboards/", hash, search))).toBe(expected);
    });

    it.each([
        [
            "#/workspace/ws1/dashboard/d1?showNavigation=true&setHeight=700&hideControl=[filterBar,topBar]",
            "",
            "/embedded/workspace/ws1/dashboards/#/dashboard/d1?showNavigation=true&setHeight=700&hideControl=[filterBar,topBar]",
        ],
        [
            "#/workspace/ws1/dashboard/d1?apiTokenAuthentication=true&externalProviderId=p1",
            "",
            "/embedded/workspace/ws1/dashboards/#/dashboard/d1?apiTokenAuthentication=true&externalProviderId=p1",
        ],
        [
            "#/workspace/ws1/dashboard/d1?filters=f%3Dlabel1%3Av1",
            "",
            "/embedded/workspace/ws1/dashboards/#/dashboard/d1?filters=f%3Dlabel1%3Av1",
        ],
        [
            "#/project/ws1/dashboard/d1",
            "?apiTokenAuthentication=true",
            "/embedded/workspace/ws1/dashboards/?apiTokenAuthentication=true#/dashboard/d1",
        ],
        ["#/p/ws1/dashboard/d1", "", "/embedded/workspace/ws1/dashboards/#/dashboard/d1"],
    ])("maps the embedded legacy KD URL %s (search %s) to %s", (hash, search, expected) => {
        expect(mapLegacyUrlToHost(location("/dashboards/embedded/", hash, search))).toBe(expected);
    });

    it.each([
        ["#/client/c1", "", "/dashboards"],
        ["#/client/c1/dashboard/d1", "?x=1", "/dashboards?x=1"],
        ["#/client/c1/dashboard/d1/tab/t1?showNavigation=true", "", "/dashboards"],
        ["#/product/p1/client/c1", "", "/dashboards"],
        ["#/product/p1/client/c1/dashboard/d1?x=1", "?y=2", "/dashboards?y=2"],
        ["#/product/p1/client/c1/new-dashboard", "", "/dashboards"],
    ])(
        "sends the workspace-less KD client URL %s (search %s) to the bare KD landing %s",
        (hash, search, expected) => {
            expect(mapLegacyUrlToHost(location("/dashboards/", hash, search))).toBe(expected);
        },
    );

    it.each(["#/client/c1/dashboard/d1", "#/product/p1/client/c1/dashboard/d1?apiTokenAuthentication=true"])(
        "keeps the embedded KD client URL %s in the frame on a route no app serves",
        (hash) => {
            expect(mapLegacyUrlToHost(location("/dashboards/embedded/", hash, "?showNavigation=false"))).toBe(
                `/embedded/organization/dashboards?showNavigation=false${hash}`,
            );
        },
    );

    it("sends the standalone KD access-denied page to the host root", () => {
        expect(mapLegacyUrlToHost(location("/dashboards/403.html"))).toBe("/");
    });

    it.each([
        ["/dashboards", ""],
        ["/dashboards/", ""],
        ["/dashboards/", "#/"],
        ["/dashboards/embedded/", ""],
    ])("leaves the bare KD landing %s%s to the host redirect", (pathname, hash) => {
        expect(mapLegacyUrlToHost(location(pathname, hash))).toBeNull();
    });

    it.each([
        ["/analyze/", "#/ws1/insight1/edit", "", "/workspace/ws1/analyze/#/insight1/edit"],
        [
            "/analyze/",
            "#/ws1/insight1/edit?sourceDashboard=d1",
            "",
            "/workspace/ws1/analyze/#/insight1/edit?sourceDashboard=d1",
        ],
        [
            "/analyze/",
            "#/ws1/reportId/edit?dataset=ds1",
            "",
            "/workspace/ws1/analyze/#/reportId/edit?dataset=ds1",
        ],
        ["/analyze/", "#/ws1/obj/123", "", "/workspace/ws1/analyze/#/obj/123"],
        ["/analyze/", "#/ws1/insight1/debug", "", "/workspace/ws1/analyze/#/insight1/debug"],
        [
            "/analyze/embedded/",
            "#/ws1?externalProviderId=p1",
            "",
            "/embedded/workspace/ws1/analyze/#?externalProviderId=p1",
        ],
        [
            "/analyze/embedded/",
            "#/ws1/insight1/edit?showEmbedButton=true",
            "?locale=en",
            "/embedded/workspace/ws1/analyze/?locale=en#/insight1/edit?showEmbedButton=true",
        ],
    ])("maps the legacy AD URL %s%s (search %s) to %s", (pathname, hash, search, expected) => {
        expect(mapLegacyUrlToHost(location(pathname, hash, search))).toBe(expected);
    });

    it.each([
        ["#/ws1/?aibuilder=v1", "", "/workspace/ws1/analyze/?aibuilder=v1"],
        ["#/ws1?aibuilder=v1", "", "/workspace/ws1/analyze/?aibuilder=v1"],
        ["#/ws1/?aibuilder=v1", "?x=1", "/workspace/ws1/analyze/?x=1&aibuilder=v1"],
        ["#/ws1/?dataset=ds1&aibuilder=v1", "", "/workspace/ws1/analyze/?aibuilder=v1#/?dataset=ds1"],
    ])("moves the AI builder draft of %s (search %s) to the query string: %s", (hash, search, expected) => {
        expect(mapLegacyUrlToHost(location("/analyze/", hash, search))).toBe(expected);
    });

    it("leaves a hash parameter that only starts like aibuilder in the hash", () => {
        expect(mapLegacyUrlToHost(location("/analyze/", "#/ws1/?aibuilderX=v1"))).toBe(
            "/workspace/ws1/analyze/#/?aibuilderX=v1",
        );
    });

    it.each([
        ["#/client/prod1:client1/insight1/edit", "", "/analyze"],
        ["#/client/prod1:client1/insight1/edit?dataset=ds1", "?x=1", "/analyze?x=1"],
        ["#/client/prod1:client1/insight1/edit/reload", "", "/analyze"],
    ])(
        "sends the workspace-less client URL %s (search %s) to the bare AD landing %s",
        (hash, search, expected) => {
            expect(mapLegacyUrlToHost(location("/analyze/", hash, search))).toBe(expected);
        },
    );

    it("keeps an embedded client URL in the frame on a route no app serves", () => {
        expect(
            mapLegacyUrlToHost(location("/analyze/embedded/", "#/client/prod1:client1/insight1/edit")),
        ).toBe("/embedded/organization/analyze#/client/prod1:client1/insight1/edit");
    });

    it.each([
        ["#/client/insight1/edit", "/workspace/client/analyze/#/insight1/edit"],
        ["#/client/sales:quarter/edit", "/workspace/client/analyze/#/sales:quarter/edit"],
        ["#/client/sales:quarter/edit/reload", "/workspace/client/analyze/#/sales:quarter/edit/reload"],
    ])("keeps a workspace named client on the workspace route: %s", (hash, expected) => {
        expect(mapLegacyUrlToHost(location("/analyze/", hash))).toBe(expected);
    });

    it("sends the standalone AD access-denied page to the host root", () => {
        expect(mapLegacyUrlToHost(location("/analyze/403.html"))).toBe("/");
    });

    it.each([
        ["/analyze", ""],
        ["/analyze/", ""],
        ["/analyze/", "#/"],
        ["/analyze/embedded/", ""],
    ])("leaves the bare AD landing %s%s to the host redirect", (pathname, hash) => {
        expect(mapLegacyUrlToHost(location(pathname, hash))).toBeNull();
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
