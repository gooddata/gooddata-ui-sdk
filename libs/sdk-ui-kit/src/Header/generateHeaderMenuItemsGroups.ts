// (C) 2007-2021 GoodData Corporation
import { ISettings, IWorkspacePermissions } from "@gooddata/sdk-backend-spi";
import { isFreemiumEdition, shouldHidePPExperience, shouldEnableNewNavigation } from "../utils/featureFlags";

import { IHeaderMenuItem } from "./typings";

/**
 * @internal
 */
export function generateHeaderMenuItemsGroups(
    featureFlags: ISettings,
    workspacePermissions: IWorkspacePermissions,
    hasAnalyticalDashboards?: boolean,
    workspaceId?: string,
    dashboardId?: string,
    tabId?: string,
    hasNoDataSet?: boolean,
    backendSupportsDataItem?: boolean,
    backendSupportsCsvUploader: boolean = true,
): IHeaderMenuItem[][] {
    if (!workspaceId) {
        return [];
    }

    const {
        enableCsvUploader,
        enableDataSection,
        analyticalDesigner,
        enableAnalyticalDashboards,
    } = featureFlags;

    const {
        canCreateAnalyticalDashboard,
        canCreateVisualization,
        canUploadNonProductionCSV,
        canAccessWorkbench,
        canManageReport,
        canManageMetric,
        canManageProject,
        canInitData,
        canRefreshData,
    } = workspacePermissions;

    const menuItemsGroups: IHeaderMenuItem[][] = [];

    const shouldHidePixelPerfectExperience = shouldHidePPExperience(featureFlags);
    const isFreemiumCustomer = isFreemiumEdition(featureFlags.platformEdition.toString());

    // PIXEL PERFECT MENU ITEMS
    if (!shouldHidePixelPerfectExperience) {
        const pixelPerfectItemsGroup = [];
        const dashboardIdAndTabId = dashboardId && tabId ? `${dashboardId}|${tabId}` : "";
        const pixelPerfectDashboardsItem = {
            key: "gs.header.dashboards",
            className: "s-menu-dashboards",
            href: `/#s=/gdc/projects/${workspaceId}|projectDashboardPage|${dashboardIdAndTabId}`,
        };
        const pixelPerfectReportsItem = {
            key: "gs.header.reports",
            className: "s-menu-reports",
            href: `/#s=/gdc/projects/${workspaceId}|domainPage|all-reports`,
        };

        const showPixelPerfectDashboardsItem = canAccessWorkbench === true;
        const showPixelPerfectReportsItem = canManageReport === true;

        if (showPixelPerfectDashboardsItem) {
            pixelPerfectItemsGroup.push(pixelPerfectDashboardsItem);
        }
        if (showPixelPerfectReportsItem) {
            pixelPerfectItemsGroup.push(pixelPerfectReportsItem);
        }
        menuItemsGroups.push(pixelPerfectItemsGroup);
    }

    // INSIGHTS MENU ITEMS
    const insightItemsGroup = [];

    const kpiDashboardsItem = {
        key: shouldEnableNewNavigation(featureFlags) ? "gs.header.kpis.new" : "gs.header.kpis",
        className: "s-menu-kpis",
        href: `/dashboards/#/project/${workspaceId}`,
    };
    const analyticalDesignerItem = {
        key: "gs.header.analyze",
        className: "s-menu-analyze",
        href: `/analyze/#/${workspaceId}/reportId/edit`,
    };

    const loadCsvItem = {
        key: "gs.header.load",
        className: "s-menu-load",
        href: `/data/#/projects/${workspaceId}/datasets`,
    };
    const dataItemLink = !backendSupportsDataItem
        ? canManageProject && hasNoDataSet
            ? `/admin/connect/#/projects/${workspaceId}/datasource`
            : `/modeler/#/projects/${workspaceId}`
        : `/modeler/#/${workspaceId}`;
    const dataItem = {
        key: "gs.header.data",
        className: "s-menu-data",
        href: dataItemLink,
    };

    const showKpiDashboardsItem =
        hasAnalyticalDashboards || (canCreateAnalyticalDashboard === true && enableAnalyticalDashboards);
    const showAnalyticalDesignerItem = canCreateVisualization === true && analyticalDesigner;

    const canAccessLoadCsvPage = canUploadNonProductionCSV === true && enableCsvUploader;
    const showLoadCsvItem = enableDataSection
        ? !isFreemiumCustomer && canAccessLoadCsvPage
        : canAccessLoadCsvPage;
    const showDataItem =
        enableDataSection &&
        (isFreemiumCustomer || backendSupportsDataItem) &&
        (canInitData || canRefreshData);

    if (showKpiDashboardsItem) {
        insightItemsGroup.push(kpiDashboardsItem);
    }
    if (showAnalyticalDesignerItem) {
        insightItemsGroup.push(analyticalDesignerItem);
    }
    if (showLoadCsvItem && backendSupportsCsvUploader) {
        insightItemsGroup.push(loadCsvItem);
    }
    if (showDataItem) {
        insightItemsGroup.push(dataItem);
    }
    menuItemsGroups.push(insightItemsGroup);

    // MANAGE ITEMS
    const manageItemsGroup = [];
    const manageItem = {
        key: "gs.header.manage",
        className: "s-menu-manage",
        href: `/#s=/gdc/projects/${workspaceId}|dataPage|`,
    };
    const showManageItem = canManageMetric;
    if (showManageItem) {
        manageItemsGroup.push(manageItem);
    }
    menuItemsGroups.push(manageItemsGroup);

    return menuItemsGroups.filter((itemsGroup) => itemsGroup.length > 0);
}
