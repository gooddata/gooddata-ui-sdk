// (C) 2022-2023 GoodData Corporation

import { buildDashboardPermissions } from "../dashboardPermissions";
import { IDashboardPermissions } from "@gooddata/sdk-model";

describe("Dashboard permissions helpers", () => {
    it("returns only view when the input value is [VIEW]", () => {
        const result = buildDashboardPermissions(["VIEW"]);

        expect(result).toEqual<IDashboardPermissions>({
            canViewDashboard: true,
            canShareDashboard: false,
            canEditDashboard: false,
        });
    });

    it("returns view,share when the input value is [SHARE]", () => {
        const result = buildDashboardPermissions(["SHARE"]);

        expect(result).toEqual<IDashboardPermissions>({
            canViewDashboard: true,
            canShareDashboard: true,
            canEditDashboard: false,
        });
    });

    it("returns view,share,edit when the input value is [EDIT]", () => {
        const result = buildDashboardPermissions(["EDIT"]);

        expect(result).toEqual<IDashboardPermissions>({
            canViewDashboard: true,
            canShareDashboard: true,
            canEditDashboard: true,
        });
    });

    it("handles multiple values and picks the strongest one", () => {
        const result = buildDashboardPermissions(["VIEW", "SHARE"]);

        expect(result).toEqual<IDashboardPermissions>({
            canViewDashboard: true,
            canShareDashboard: true,
            canEditDashboard: false,
        });
    });

    it("handles empty list resulting in all permissions false", () => {
        const result = buildDashboardPermissions([]);

        expect(result).toEqual<IDashboardPermissions>({
            canViewDashboard: false,
            canShareDashboard: false,
            canEditDashboard: false,
        });
    });
});
