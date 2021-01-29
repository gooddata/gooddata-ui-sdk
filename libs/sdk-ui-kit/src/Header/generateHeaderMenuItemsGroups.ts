// (C) 2007-2021 GoodData Corporation
import { ISettings, IWorkspacePermissions } from "@gooddata/sdk-backend-spi";
import { IHeaderMenuItem } from "./Header";
import { isFreemiumEdition, shouldEnableNewNavigation, shouldHidePPExperience } from "../utils/featureFlags";

/**
 * @internal
 */
export function generateHeaderMenuItemsGroups(
    featureFlags: ISettings,
    workspacePermissions: IWorkspacePermissions,
    workspaceId?: string,
    dashboardId?: string,
    tabId?: string,
    hasNoDataSet?: boolean,
    hasAnalyticalDashboards?: boolean,
    showKDTab?: boolean,
    showADTab?: boolean,
): IHeaderMenuItem[][] {
    if (!workspaceId) {
        return [];
    }

    const {
        enableCsvUploader,
        enableDataSection,
        enableAnalyticalDashboards,
        analyticalDesigner,
    } = featureFlags;

    const {
        canUploadNonProductionCSV,
        canAccessWorkbench,
        canManageReport,
        canManageMetric,
        canManageProject,
        canInitData,
        canRefreshData,
        canCreateAnalyticalDashboard,
        canCreateVisualization,
    } = workspacePermissions;

    const menuItemsGroups: IHeaderMenuItem[][] = [];

    const shouldHidePixelPerfectExperience = shouldHidePPExperience(featureFlags);
    const isFreemiumCustomer = isFreemiumEdition(featureFlags.platformEdition.toString());
    const enableNewNavigation = shouldEnableNewNavigation(featureFlags);

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
        key: enableNewNavigation ? "gs.header.kpis.new" : "gs.header.kpis",
        className: "s-menu-kpis",
        href: `/dashboards/#/project/${workspaceId}`,
    };
    const analyticalDesignerItem = {
        key: enableNewNavigation ? "gs.header.analyze.new" : "gs.header.analyze",
        className: "s-menu-analyze",
        href: `/analyze/#/${workspaceId}/reportId/edit`,
    };
    const loadCsvItem = {
        key: "gs.header.load",
        className: "s-menu-load",
        href: `/data/#/projects/${workspaceId}/datasets`,
    };
    const dataItemLink =
        canManageProject && hasNoDataSet
            ? `/admin/connect/#/projects/${workspaceId}/datasource`
            : `/admin/modeler/#/projects/${workspaceId}`;
    const dataItem = {
        key: "gs.header.data",
        className: "s-menu-data",
        href: dataItemLink,
    };
    const showKpiDashboardsItem =
        showKDTab ||
        hasAnalyticalDashboards ||
        (canCreateAnalyticalDashboard === true && enableAnalyticalDashboards);
    const showAnalyticalDesignerItem = showADTab || (canCreateVisualization === true && analyticalDesigner);
    const canAccessLoadCsvPage = canUploadNonProductionCSV === true && enableCsvUploader;
    const showLoadCsvItem = enableDataSection
        ? !isFreemiumCustomer && canAccessLoadCsvPage
        : canAccessLoadCsvPage;
    const showDataItem = enableDataSection && isFreemiumCustomer && (canInitData || canRefreshData);

    if (showKpiDashboardsItem) {
        insightItemsGroup.push(kpiDashboardsItem);
    }
    if (showAnalyticalDesignerItem) {
        insightItemsGroup.push(analyticalDesignerItem);
    }
    if (showLoadCsvItem) {
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
    const showManageItem = canManageMetric === true;
    if (showManageItem) {
        manageItemsGroup.push(manageItem);
    }
    menuItemsGroups.push(manageItemsGroup);

    return menuItemsGroups.filter((itemsGroup) => itemsGroup.length > 0);
}
