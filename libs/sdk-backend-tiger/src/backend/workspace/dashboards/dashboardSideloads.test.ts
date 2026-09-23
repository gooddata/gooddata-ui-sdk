// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { dashboardSideloadIncludes } from "./dashboardSideloads.js";

describe("dashboardSideloadIncludes", () => {
    it("always side-loads filter contexts and adds one include per requested type in request order", () => {
        expect(dashboardSideloadIncludes([])).toEqual(["filterContexts"]);
        expect(dashboardSideloadIncludes(["dataSet", "insight"])).toEqual([
            "filterContexts",
            "visualizationObjects",
            "datasets",
        ]);
        expect(dashboardSideloadIncludes(["dashboardPlugin", "analyticalDashboard"])).toEqual([
            "filterContexts",
            "dashboardPlugins",
            "analyticalDashboards",
        ]);
    });

    it("side-loads metrics for measure, which is how a rich text reference is linked", () => {
        expect(dashboardSideloadIncludes(["measure"])).toEqual(["filterContexts", "metrics"]);
    });

    it("side-loads computed attributes, which a rich text reference can also name", () => {
        expect(dashboardSideloadIncludes(["computedAttribute"])).toEqual([
            "filterContexts",
            "computedAttributes",
        ]);
    });

    it("side-loads dashboard labels used by custom URL dependencies", () => {
        expect(dashboardSideloadIncludes(["displayForm"])).toEqual(["filterContexts", "labels"]);
    });
});
