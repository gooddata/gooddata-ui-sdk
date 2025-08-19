// (C) 2022-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { IDashboardPermissions } from "@gooddata/sdk-model";

import { buildDashboardPermissions } from "../dashboardPermissions.js";

describe("Dashboard permissions helpers", () => {
    it("returns only view when the input value is [VIEW]", () => {
        const result = buildDashboardPermissions(["VIEW"]);

        expect(result).toEqual<IDashboardPermissions>({
            canViewDashboard: true,
            canShareDashboard: false,
            canShareLockedDashboard: false,
            canEditDashboard: false,
            canEditLockedDashboard: false,
        });
    });

    it("returns view,share when the input value is [SHARE]", () => {
        const result = buildDashboardPermissions(["SHARE"]);

        expect(result).toEqual<IDashboardPermissions>({
            canViewDashboard: true,
            canShareDashboard: true,
            canShareLockedDashboard: true,
            canEditDashboard: false,
            canEditLockedDashboard: false,
        });
    });

    it("returns view,share,edit when the input value is [EDIT]", () => {
        const result = buildDashboardPermissions(["EDIT"]);

        expect(result).toEqual<IDashboardPermissions>({
            canViewDashboard: true,
            canShareDashboard: true,
            canShareLockedDashboard: true,
            canEditDashboard: true,
            canEditLockedDashboard: false,
        });
    });

    it("handles multiple values and picks the strongest one", () => {
        const result = buildDashboardPermissions(["VIEW", "SHARE"]);

        expect(result).toEqual<IDashboardPermissions>({
            canViewDashboard: true,
            canShareDashboard: true,
            canShareLockedDashboard: true,
            canEditDashboard: false,
            canEditLockedDashboard: false,
        });
    });

    it("handles empty list resulting in all permissions false", () => {
        const result = buildDashboardPermissions([]);

        expect(result).toEqual<IDashboardPermissions>({
            canViewDashboard: false,
            canShareDashboard: false,
            canShareLockedDashboard: false,
            canEditDashboard: false,
            canEditLockedDashboard: false,
        });
    });
});
