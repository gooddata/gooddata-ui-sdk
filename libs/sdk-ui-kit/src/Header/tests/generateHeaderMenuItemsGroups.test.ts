// (C) 2021-2022 GoodData Corporation
import { getAccountMenuFeatureFlagsMock, getWorkspacePermissionsMock } from "./mock";
import { generateHeaderMenuItemsGroups } from "../generateHeaderMenuItemsGroups";

describe("generateHeaderMenuItemsGroups", () => {
    it("should return dashboards and report items if hidePixelPerfectExperience is false", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, false, true, "enterprise", false),
            getWorkspacePermissionsMock(true, true),
            true,
            "TestWorkspaceId",
            "TestDashboardId",
            "TestTabId",
            false,
            false,
        );
        expect(items).toEqual([
            [
                {
                    className: "s-menu-dashboards",
                    href: "/#s=/gdc/projects/TestWorkspaceId|projectDashboardPage|TestDashboardId|TestTabId",
                    key: "gs.header.dashboards",
                },
                {
                    className: "s-menu-reports",
                    href: "/#s=/gdc/projects/TestWorkspaceId|domainPage|all-reports",
                    key: "gs.header.reports",
                },
            ],
            [
                {
                    className: "s-menu-kpis",
                    href: "/dashboards/#/project/TestWorkspaceId",
                    key: "gs.header.kpis",
                },
                {
                    className: "s-menu-analyze",
                    href: "/analyze/#/TestWorkspaceId/reportId/edit",
                    key: "gs.header.analyze",
                },
                {
                    className: "s-menu-data",
                    href: "/modeler/#/projects/TestWorkspaceId",
                    key: "gs.header.data",
                },
                {
                    className: "s-menu-load",
                    href: "/data/#/projects/TestWorkspaceId/datasets",
                    key: "gs.header.load",
                },
            ],
            [
                {
                    className: "s-menu-manage",
                    href: "/#s=/gdc/projects/TestWorkspaceId|dataPage|",
                    key: "gs.header.manage",
                },
            ],
        ]);
    });

    it("should return dashboards and report items with workspace in uri if hidePixelPerfectExperience is false and enableRenamingProjectToWorkspace is true", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, false, true, "enterprise", true),
            getWorkspacePermissionsMock(true, true),
            true,
            "TestWorkspaceId",
            "TestDashboardId",
            "TestTabId",
            false,
            false,
        );
        expect(items).toEqual([
            [
                {
                    className: "s-menu-dashboards",
                    href: "/#s=/gdc/workspaces/TestWorkspaceId|workspaceDashboardPage|TestDashboardId|TestTabId",
                    key: "gs.header.dashboards",
                },
                {
                    className: "s-menu-reports",
                    href: "/#s=/gdc/workspaces/TestWorkspaceId|domainPage|all-reports",
                    key: "gs.header.reports",
                },
            ],
            [
                {
                    className: "s-menu-kpis",
                    href: "/dashboards/#/workspace/TestWorkspaceId",
                    key: "gs.header.kpis",
                },
                {
                    className: "s-menu-analyze",
                    href: "/analyze/#/TestWorkspaceId/reportId/edit",
                    key: "gs.header.analyze",
                },
                {
                    className: "s-menu-data",
                    href: "/modeler/#/workspaces/TestWorkspaceId",
                    key: "gs.header.data",
                },
                {
                    className: "s-menu-load",
                    href: "/data/#/workspaces/TestWorkspaceId/datasets",
                    key: "gs.header.load",
                },
            ],
            [
                {
                    className: "s-menu-manage",
                    href: "/#s=/gdc/workspaces/TestWorkspaceId|dataPage|",
                    key: "gs.header.manage",
                },
            ],
        ]);
    });

    it("should not return dashboards and report item if hidePixelPerfectExperience is true", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, true, false, "enterprise", false),
            getWorkspacePermissionsMock(true, true),
            false,
            "TestWorkspaceId",
            "TestDashboardId",
            "TestTabId",
            false,
            false,
        );
        expect(items).toEqual([
            [
                {
                    className: "s-menu-data",
                    href: "/modeler/#/projects/TestWorkspaceId",
                    key: "gs.header.data",
                },
                {
                    className: "s-menu-load",
                    href: "/data/#/projects/TestWorkspaceId/datasets",
                    key: "gs.header.load",
                },
            ],
            [
                {
                    className: "s-menu-manage",
                    href: "/#s=/gdc/projects/TestWorkspaceId|dataPage|",
                    key: "gs.header.manage",
                },
            ],
        ]);
    });

    it("should not return dashboards and report item with workspace in uri if hidePixelPerfectExperience is true and enableRenamingProjectToWorkspace is true", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, true, false, "enterprise", true),
            getWorkspacePermissionsMock(true, true),
            false,
            "TestWorkspaceId",
            "TestDashboardId",
            "TestTabId",
            false,
            false,
        );
        expect(items).toEqual([
            [
                {
                    className: "s-menu-data",
                    href: "/modeler/#/workspaces/TestWorkspaceId",
                    key: "gs.header.data",
                },
                {
                    className: "s-menu-load",
                    href: "/data/#/workspaces/TestWorkspaceId/datasets",
                    key: "gs.header.load",
                },
            ],
            [
                {
                    className: "s-menu-manage",
                    href: "/#s=/gdc/workspaces/TestWorkspaceId|dataPage|",
                    key: "gs.header.manage",
                },
            ],
        ]);
    });

    it("should return data item if platformEdition is free and hasNoDataSet is false", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, true, false, "free", false),
            getWorkspacePermissionsMock(true, true),
            false,
            "TestWorkspaceId",
            "TestDashboardId",
            "TestTabId",
            false,
        );
        expect(items).toEqual([
            [
                {
                    className: "s-menu-data",
                    href: "/modeler/#/projects/TestWorkspaceId",
                    key: "gs.header.data",
                },
            ],
            [
                {
                    className: "s-menu-manage",
                    href: "/#s=/gdc/projects/TestWorkspaceId|dataPage|",
                    key: "gs.header.manage",
                },
            ],
        ]);
    });

    it("should return data item with workspace in uri if platformEdition is free, hasNoDataSet is false and enableRenamingProjectToWorkspace is true", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, true, false, "free", true),
            getWorkspacePermissionsMock(true, true),
            false,
            "TestWorkspaceId",
            "TestDashboardId",
            "TestTabId",
            false,
        );
        expect(items).toEqual([
            [
                {
                    className: "s-menu-data",
                    href: "/modeler/#/workspaces/TestWorkspaceId",
                    key: "gs.header.data",
                },
            ],
            [
                {
                    className: "s-menu-manage",
                    href: "/#s=/gdc/workspaces/TestWorkspaceId|dataPage|",
                    key: "gs.header.manage",
                },
            ],
        ]);
    });

    it("should return data item with datasource href if platformEdition is free and hasNoDataSet is true", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, true, false, "free", false),
            getWorkspacePermissionsMock(true, true),
            true,
            "TestWorkspaceId",
            "TestDashboardId",
            "TestTabId",
            true,
        );
        expect(items).toEqual([
            [
                {
                    className: "s-menu-kpis",
                    href: "/dashboards/#/project/TestWorkspaceId",
                    key: "gs.header.kpis",
                },
                {
                    className: "s-menu-data",
                    href: "/admin/connect/#/projects/TestWorkspaceId/datasource",
                    key: "gs.header.data",
                },
            ],
            [
                {
                    className: "s-menu-manage",
                    href: "/#s=/gdc/projects/TestWorkspaceId|dataPage|",
                    key: "gs.header.manage",
                },
            ],
        ]);
    });

    it("should return data item with datasource href and workspace in uri if platformEdition is free, hasNoDataSet is true and enableRenamingProjectToWorkspace is true", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, true, false, "free", true),
            getWorkspacePermissionsMock(true, true),
            true,
            "TestWorkspaceId",
            "TestDashboardId",
            "TestTabId",
            true,
        );
        expect(items).toEqual([
            [
                {
                    className: "s-menu-kpis",
                    href: "/dashboards/#/workspace/TestWorkspaceId",
                    key: "gs.header.kpis",
                },
                {
                    className: "s-menu-data",
                    href: "/admin/connect/#/workspaces/TestWorkspaceId/datasource",
                    key: "gs.header.data",
                },
            ],
            [
                {
                    className: "s-menu-manage",
                    href: "/#s=/gdc/workspaces/TestWorkspaceId|dataPage|",
                    key: "gs.header.manage",
                },
            ],
        ]);
    });

    it("should not return manage item if canManageMetric is false", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, true, false, "free", false),
            getWorkspacePermissionsMock(true, false),
            false,
            "TestWorkspaceId",
            "TestDashboardId",
            "TestTabId",
            false,
        );
        expect(items).toEqual([
            [
                {
                    className: "s-menu-data",
                    href: "/modeler/#/projects/TestWorkspaceId",
                    key: "gs.header.data",
                },
            ],
        ]);
    });

    it("should not return manage item with workspace in uri if canManageMetric is false and enableRenamingProjectToWorkspace is true", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, true, false, "free", true),
            getWorkspacePermissionsMock(true, false),
            false,
            "TestWorkspaceId",
            "TestDashboardId",
            "TestTabId",
            false,
        );
        expect(items).toEqual([
            [
                {
                    className: "s-menu-data",
                    href: "/modeler/#/workspaces/TestWorkspaceId",
                    key: "gs.header.data",
                },
            ],
        ]);
    });

    it("should not return data item if backendSupportsDataItem is false and platform edition is not free", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, true, false, "enterprise", false),
            getWorkspacePermissionsMock(true, false),
            false,
            "TestWorkspaceId",
            "TestDashboardId",
            "TestTabId",
            false,
            false,
        );
        expect(items).toEqual([
            [
                {
                    className: "s-menu-data",
                    href: "/modeler/#/projects/TestWorkspaceId",
                    key: "gs.header.data",
                },
                {
                    className: "s-menu-load",
                    href: "/data/#/projects/TestWorkspaceId/datasets",
                    key: "gs.header.load",
                },
            ],
        ]);
    });

    it("should not return data item with workspace in uri if backendSupportsDataItem is false, platform edition is not free and enableRenamingProjectToWorkspace is true", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, true, false, "enterprise", true),
            getWorkspacePermissionsMock(true, false),
            false,
            "TestWorkspaceId",
            "TestDashboardId",
            "TestTabId",
            false,
            false,
        );
        expect(items).toEqual([
            [
                {
                    className: "s-menu-data",
                    href: "/modeler/#/workspaces/TestWorkspaceId",
                    key: "gs.header.data",
                },
                {
                    className: "s-menu-load",
                    href: "/data/#/workspaces/TestWorkspaceId/datasets",
                    key: "gs.header.load",
                },
            ],
        ]);
    });

    it("should not return load item if backendSupportsCsvUploader is false", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, false, true, "enterprise", false),
            getWorkspacePermissionsMock(true, true),
            true,
            "TestWorkspaceId",
            "TestDashboardId",
            "TestTabId",
            false,
            false,
            false,
        );
        expect(items).toEqual([
            [
                {
                    className: "s-menu-dashboards",
                    href: "/#s=/gdc/projects/TestWorkspaceId|projectDashboardPage|TestDashboardId|TestTabId",
                    key: "gs.header.dashboards",
                },
                {
                    className: "s-menu-reports",
                    href: "/#s=/gdc/projects/TestWorkspaceId|domainPage|all-reports",
                    key: "gs.header.reports",
                },
            ],
            [
                {
                    className: "s-menu-kpis",
                    href: "/dashboards/#/project/TestWorkspaceId",
                    key: "gs.header.kpis",
                },
                {
                    className: "s-menu-analyze",
                    href: "/analyze/#/TestWorkspaceId/reportId/edit",
                    key: "gs.header.analyze",
                },
                {
                    className: "s-menu-data",
                    href: "/modeler/#/projects/TestWorkspaceId",
                    key: "gs.header.data",
                },
            ],
            [
                {
                    className: "s-menu-manage",
                    href: "/#s=/gdc/projects/TestWorkspaceId|dataPage|",
                    key: "gs.header.manage",
                },
            ],
        ]);
    });

    it("should not return load item with workspace in uri  if backendSupportsCsvUploader is false and enableRenamingProjectToWorkspace is true", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, false, true, "enterprise", true),
            getWorkspacePermissionsMock(true, true),
            true,
            "TestWorkspaceId",
            "TestDashboardId",
            "TestTabId",
            false,
            false,
            false,
        );
        expect(items).toEqual([
            [
                {
                    className: "s-menu-dashboards",
                    href: "/#s=/gdc/workspaces/TestWorkspaceId|workspaceDashboardPage|TestDashboardId|TestTabId",
                    key: "gs.header.dashboards",
                },
                {
                    className: "s-menu-reports",
                    href: "/#s=/gdc/workspaces/TestWorkspaceId|domainPage|all-reports",
                    key: "gs.header.reports",
                },
            ],
            [
                {
                    className: "s-menu-kpis",
                    href: "/dashboards/#/workspace/TestWorkspaceId",
                    key: "gs.header.kpis",
                },
                {
                    className: "s-menu-analyze",
                    href: "/analyze/#/TestWorkspaceId/reportId/edit",
                    key: "gs.header.analyze",
                },
                {
                    className: "s-menu-data",
                    href: "/modeler/#/workspaces/TestWorkspaceId",
                    key: "gs.header.data",
                },
            ],
            [
                {
                    className: "s-menu-manage",
                    href: "/#s=/gdc/workspaces/TestWorkspaceId|dataPage|",
                    key: "gs.header.manage",
                },
            ],
        ]);
    });

    it("should return dashboards and report items if hasMeasures is true", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, false, true, "enterprise", false),
            getWorkspacePermissionsMock(true, true),
            true,
            "TestWorkspaceId",
            "TestDashboardId",
            "TestTabId",
            false,
            false,
            true,
            true,
        );
        expect(items).toEqual([
            [
                {
                    className: "s-menu-dashboards",
                    href: "/#s=/gdc/projects/TestWorkspaceId|projectDashboardPage|TestDashboardId|TestTabId",
                    key: "gs.header.dashboards",
                },
                {
                    className: "s-menu-reports",
                    href: "/#s=/gdc/projects/TestWorkspaceId|domainPage|all-reports",
                    key: "gs.header.reports",
                },
            ],
            [
                {
                    className: "s-menu-kpis",
                    href: "/dashboards/#/project/TestWorkspaceId",
                    key: "gs.header.kpis",
                },
                {
                    className: "s-menu-analyze",
                    href: "/analyze/#/TestWorkspaceId/reportId/edit",
                    key: "gs.header.analyze",
                },
                {
                    className: "s-menu-metrics",
                    href: "/metrics/#/TestWorkspaceId",
                    key: "gs.header.metrics",
                },
                {
                    className: "s-menu-data",
                    href: "/modeler/#/projects/TestWorkspaceId",
                    key: "gs.header.data",
                },
                {
                    className: "s-menu-load",
                    href: "/data/#/projects/TestWorkspaceId/datasets",
                    key: "gs.header.load",
                },
            ],
            [
                {
                    className: "s-menu-manage",
                    href: "/#s=/gdc/projects/TestWorkspaceId|dataPage|",
                    key: "gs.header.manage",
                },
            ],
        ]);
    });

    it("should return dashboards and report items if hasMeasures is true but canManageMetric is false", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, false, true, "enterprise", false),
            getWorkspacePermissionsMock(true, false),
            true,
            "TestWorkspaceId",
            "TestDashboardId",
            "TestTabId",
            false,
            false,
            true,
            true,
        );
        expect(items).toEqual([
            [
                {
                    className: "s-menu-dashboards",
                    href: "/#s=/gdc/projects/TestWorkspaceId|projectDashboardPage|TestDashboardId|TestTabId",
                    key: "gs.header.dashboards",
                },
                {
                    className: "s-menu-reports",
                    href: "/#s=/gdc/projects/TestWorkspaceId|domainPage|all-reports",
                    key: "gs.header.reports",
                },
            ],
            [
                {
                    className: "s-menu-kpis",
                    href: "/dashboards/#/project/TestWorkspaceId",
                    key: "gs.header.kpis",
                },
                {
                    className: "s-menu-analyze",
                    href: "/analyze/#/TestWorkspaceId/reportId/edit",
                    key: "gs.header.analyze",
                },
                {
                    className: "s-menu-data",
                    href: "/modeler/#/projects/TestWorkspaceId",
                    key: "gs.header.data",
                },
                {
                    className: "s-menu-load",
                    href: "/data/#/projects/TestWorkspaceId/datasets",
                    key: "gs.header.load",
                },
            ],
        ]);
    });

    it("should return dashboards and report items if hasManage is false", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, false, true, "enterprise", false),
            getWorkspacePermissionsMock(true, true),
            true,
            "TestWorkspaceId",
            "TestDashboardId",
            "TestTabId",
            false,
            false,
            true,
            true,
            false,
        );
        expect(items).toEqual([
            [
                {
                    className: "s-menu-dashboards",
                    href: "/#s=/gdc/projects/TestWorkspaceId|projectDashboardPage|TestDashboardId|TestTabId",
                    key: "gs.header.dashboards",
                },
                {
                    className: "s-menu-reports",
                    href: "/#s=/gdc/projects/TestWorkspaceId|domainPage|all-reports",
                    key: "gs.header.reports",
                },
            ],
            [
                {
                    className: "s-menu-kpis",
                    href: "/dashboards/#/project/TestWorkspaceId",
                    key: "gs.header.kpis",
                },
                {
                    className: "s-menu-analyze",
                    href: "/analyze/#/TestWorkspaceId/reportId/edit",
                    key: "gs.header.analyze",
                },
                {
                    className: "s-menu-metrics",
                    href: "/metrics/#/TestWorkspaceId",
                    key: "gs.header.metrics",
                },
                {
                    className: "s-menu-data",
                    href: "/modeler/#/projects/TestWorkspaceId",
                    key: "gs.header.data",
                },
                {
                    className: "s-menu-load",
                    href: "/data/#/projects/TestWorkspaceId/datasets",
                    key: "gs.header.load",
                },
            ],
        ]);
    });

    it("should return dashboards if feature flags are empty", () => {
        const items = generateHeaderMenuItemsGroups(
            {},
            getWorkspacePermissionsMock(true, true),
            true,
            "TestWorkspaceId",
            "TestDashboardId",
            "TestTabId",
            false,
            false,
            false,
            false,
        );
        expect(items).toEqual([
            [
                {
                    className: "s-menu-dashboards",
                    href: "/#s=/gdc/projects/TestWorkspaceId|projectDashboardPage|TestDashboardId|TestTabId",
                    key: "gs.header.dashboards",
                },
                {
                    className: "s-menu-reports",
                    href: "/#s=/gdc/projects/TestWorkspaceId|domainPage|all-reports",
                    key: "gs.header.reports",
                },
            ],
            [
                {
                    className: "s-menu-kpis",
                    href: "/dashboards/#/project/TestWorkspaceId",
                    key: "gs.header.kpis",
                },
            ],
            [
                {
                    className: "s-menu-manage",
                    href: "/#s=/gdc/projects/TestWorkspaceId|dataPage|",
                    key: "gs.header.manage",
                },
            ],
        ]);
    });
});
