// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";

import { analyticalDashboardUriFactorySelector } from "./uri_selector.js";

describe("uri_selector", () => {
    describe("analyticalDashboardUriFactorySelector", () => {
        it("should return legacy standalone uri when shell application is disabled", () => {
            const settings = { enableShellApplication_dashboards: false } as IUserWorkspaceSettings;
            const result = analyticalDashboardUriFactorySelector.resultFunc("mockProject", settings);
            expect(result("abc")).toEqual("/dashboards/#/workspace/mockProject/dashboard/abc");
        });

        it("should return host route uri when shell application is enabled", () => {
            const settings = { enableShellApplication_dashboards: true } as IUserWorkspaceSettings;
            const result = analyticalDashboardUriFactorySelector.resultFunc("mockProject", settings);
            expect(result("abc")).toEqual("/workspace/mockProject/dashboards/#/dashboard/abc");
        });
    });
});
