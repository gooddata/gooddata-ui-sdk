// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it } from "vitest";

import {
    LEGACY_HOME_PATHS,
    getHostBasePath,
    getHostPathname,
    isEmbeddedHostPage,
    resetHostBasePath,
    splitHostBasePath,
    withHostBasePath,
} from "./hostBasePath.js";

const HOST_ROUTES = [
    "/embedded/workspace/ws1/dashboards/",
    "/embedded/organization/settings",
    "/organization",
    "/organization/settings/workspaces",
    "/workspace/ws1",
    "/workspace/ws1/analyze/",
    "/workspace/ws1/reports/document/d1",
    "/dashboards/embedded/",
    "/dashboards",
    "/analyze/embedded/",
    "/analyze/403.html",
    "/metrics/",
    "/modeler/",
    ...LEGACY_HOME_PATHS,
];

describe("splitHostBasePath", () => {
    it.each(HOST_ROUTES)("leaves the unprefixed route %s unchanged", (path) => {
        expect(splitHostBasePath(path)).toEqual({ basePath: "", path });
    });

    it.each(HOST_ROUTES)("splits the proxy prefix off %s", (path) => {
        expect(splitHostBasePath(`/ext/gdcn${path}`)).toEqual({ basePath: "/ext/gdcn", path });
    });

    it.each([
        ["a one-segment prefix", "/gd/workspace/ws1/dashboards/", "/gd", "/workspace/ws1/dashboards/"],
        [
            "a deeper prefix",
            "/a/b/c/embedded/workspace/ws1/dashboards/",
            "/a/b/c",
            "/embedded/workspace/ws1/dashboards/",
        ],
        [
            "a route root repeated further down",
            "/ext/workspace/organization/x",
            "/ext",
            "/workspace/organization/x",
        ],
        [
            "a route root word inside a segment",
            "/my-workspace/workspace/ws1",
            "/my-workspace",
            "/workspace/ws1",
        ],
        ["an encoded prefix segment", "/ext%20gd/workspace/ws1", "/ext%20gd", "/workspace/ws1"],
        [
            "a duplicate separator after the prefix",
            "/ext/gdcn//embedded/workspace/ws1",
            "/ext/gdcn",
            "//embedded/workspace/ws1",
        ],
    ])("splits %s", (_case, pathname, basePath, path) => {
        expect(splitHostBasePath(pathname)).toEqual({ basePath, path });
    });

    it.each([
        ["the domain root", "/"],
        ["an empty pathname", ""],
        ["the bare prefix", "/ext/gdcn/"],
        ["an unknown page", "/unknown/page"],
        ["a route root word with another case", "/ext/Workspace/ws1"],
    ])("leaves %s whole", (_case, pathname) => {
        expect(splitHostBasePath(pathname)).toEqual({ basePath: "", path: pathname });
    });

    it("takes the first route root, so a prefix containing one is misread", () => {
        expect(splitHostBasePath("/organization/gd/workspace/ws1")).toEqual({
            basePath: "",
            path: "/organization/gd/workspace/ws1",
        });
    });
});

describe("withHostBasePath", () => {
    it.each([
        ["a host route", "/workspace/ws1/analyze", "/ext/gdcn", "/ext/gdcn/workspace/ws1/analyze"],
        ["a host route with query and hash", "/workspace/ws1?x=1#/a", "/ext", "/ext/workspace/ws1?x=1#/a"],
        ["a host route without a prefix", "/workspace/ws1/analyze", "", "/workspace/ws1/analyze"],
        ["an absolute URL", "https://example.com/workspace/ws1", "/ext", "https://example.com/workspace/ws1"],
        ["a protocol-relative URL", "//example.com/workspace/ws1", "/ext", "//example.com/workspace/ws1"],
        ["a relative URL", "analyze", "/ext", "analyze"],
    ])("handles %s", (_case, url, basePath, expected) => {
        expect(withHostBasePath(url, basePath)).toBe(expected);
    });
});

describe("current page", () => {
    afterEach(() => {
        window.history.replaceState(null, "", "/");
    });

    it.each([
        ["/embedded/workspace/ws1/dashboards/", "", "/embedded/workspace/ws1/dashboards/", true],
        [
            "/ext/gdcn/embedded/workspace/ws1/dashboards/",
            "/ext/gdcn",
            "/embedded/workspace/ws1/dashboards/",
            true,
        ],
        ["/workspace/ws1/dashboards/", "", "/workspace/ws1/dashboards/", false],
        ["/ext/gdcn/workspace/ws1/dashboards/", "/ext/gdcn", "/workspace/ws1/dashboards/", false],
        ["/ext/embedded-reports/workspace/ws1", "/ext/embedded-reports", "/workspace/ws1", false],
    ])("reads %s", (pathname, basePath, hostPathname, embedded) => {
        window.history.replaceState(null, "", `${pathname}?x=1#/dashboard/d1`);

        expect(getHostBasePath()).toBe(basePath);
        expect(getHostPathname()).toBe(hostPathname);
        expect(isEmbeddedHostPage()).toBe(embedded);
    });

    it("keeps the prefix detected first when the page moves to a route without a known segment", () => {
        window.history.replaceState(null, "", "/ext/gdcn/workspace/ws1/analyze");
        expect(getHostBasePath()).toBe("/ext/gdcn");

        window.history.replaceState(null, "", "/ext/gdcn");

        expect(getHostBasePath()).toBe("/ext/gdcn");
        expect(getHostPathname()).toBe("/");
    });

    it("detects the prefix again after a reset", () => {
        window.history.replaceState(null, "", "/ext/gdcn/workspace/ws1");
        expect(getHostBasePath()).toBe("/ext/gdcn");

        resetHostBasePath();
        window.history.replaceState(null, "", "/workspace/ws1");

        expect(getHostBasePath()).toBe("");
    });
});
