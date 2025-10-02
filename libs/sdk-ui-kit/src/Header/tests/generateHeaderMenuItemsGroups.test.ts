// (C) 2021-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { getAccountMenuFeatureFlagsMock, getWorkspacePermissionsMock } from "./mock.js";
import { generateHeaderMenuItemsGroups } from "../generateHeaderMenuItemsGroups.js";

describe("generateHeaderMenuItemsGroups", () => {
    it("should not return dashboards and report items if hidePixelPerfectExperience is false", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, false, "enterprise"),
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
            getAccountMenuFeatureFlagsMock(true, true, "enterprise"),
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

    it("should not return dashboards and report item with workspace in uri if hidePixelPerfectExperience is true", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, "enterprise"),
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

    it("should return data item if platformEdition is free and hasNoDataSet is false", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, "free"),
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

    it("should return data item with workspace in uri if platformEdition is free, hasNoDataSet is false", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, "free"),
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

    it("should return data item with datasource href if platformEdition is free and hasNoDataSet is true", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, "free"),
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
                    className: "s-menu-analyze",
                    href: "/analyze/#/TestWorkspaceId/reportId/edit",
                    key: "gs.header.analyze",
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

    it("should return data item with datasource href and workspace in uri if platformEdition is free, hasNoDataSet is true", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, "free"),
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
                    className: "s-menu-analyze",
                    href: "/analyze/#/TestWorkspaceId/reportId/edit",
                    key: "gs.header.analyze",
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
            getAccountMenuFeatureFlagsMock(true, true, "free"),
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
        ]);
    });

    it("should not return manage item with workspace in uri if canManageMetric is false", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, "free"),
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
        ]);
    });

    it("should not return data item if backendSupportsDataItem is false and platform edition is not free", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, "enterprise"),
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
        ]);
    });

    it("should not return data item with workspace in uri if backendSupportsDataItem is false, platform edition is not free", () => {
        const items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, "enterprise"),
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
        ]);
    });

    it("should not return dashboards if feature flags are empty", () => {
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
                    className: "s-menu-kpis",
                    href: "/dashboards/#/workspace/TestWorkspaceId",
                    key: "gs.header.kpis",
                },
                {
                    className: "s-menu-analyze",
                    href: "/analyze/#/TestWorkspaceId/reportId/edit",
                    key: "gs.header.analyze",
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

    it("should return relative paths for Panther", () => {
        const items = generateHeaderMenuItemsGroups(
            { enableDataSection: true },
            getWorkspacePermissionsMock(true, true),
            true,
            "TestWorkspaceId",
            "TestDashboardId",
            undefined,
            false,
            true,
            false,
            true,
            false,
        );

        expect(items).toMatchSnapshot();
    });

    it("should return absolute paths for Panther", () => {
        const items = generateHeaderMenuItemsGroups(
            { enableDataSection: true },
            getWorkspacePermissionsMock(true, true),
            true,
            "TestWorkspaceId",
            "TestDashboardId",
            undefined,
            false,
            true,
            false,
            true,
            false,
            "https://cdnUrl",
        );

        expect(items).toMatchSnapshot();
    });

    it("should return correct absolute paths for Panther when baseUrl ends with slash", () => {
        const items = generateHeaderMenuItemsGroups(
            { enableDataSection: true },
            getWorkspacePermissionsMock(true, true),
            true,
            "TestWorkspaceId",
            "TestDashboardId",
            undefined,
            false,
            true,
            false,
            true,
            false,
            "https://cdnUrl/",
        );

        expect(items).toMatchSnapshot();
    });
});
