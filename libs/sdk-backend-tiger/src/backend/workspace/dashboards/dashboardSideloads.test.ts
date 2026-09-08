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

    it("does not side-load labels for displayForm because they are resolved from filter contexts", () => {
        expect(dashboardSideloadIncludes(["displayForm"])).toEqual(["filterContexts"]);
    });
});
