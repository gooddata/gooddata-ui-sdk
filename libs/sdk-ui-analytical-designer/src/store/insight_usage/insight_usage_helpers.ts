// (C) 2020-2026 GoodData Corporation

import { type IPublisherDocumentSummaryV2 } from "@gooddata/sdk-backend-spi";
import {
    type IListedDashboard,
    type IMetadataObject,
    type IWorkspacePermissions,
    objRefToString,
} from "@gooddata/sdk-model";
import { _sortBy } from "@gooddata/util";

import {
    type IInsightUsageInDocuments,
    type IInsightUsageOnDashboard,
    type IInsightUsageOnDashboardItem,
} from "./insight_usage_state.js";

export const sortDashboards = (dashboards: IInsightUsageOnDashboardItem[], sourceDashboardId: string) =>
    _sortBy(dashboards, (dashboardMeta: IInsightUsageOnDashboardItem) => {
        // source dashboard should be placed on the top
        if (dashboardMeta.id === sourceDashboardId) {
            return "";
        }
        return dashboardMeta.title.trim().toLowerCase();
    });

const isUserDashboard = (userDashboards: IListedDashboard[], { id }: IInsightUsageOnDashboardItem) =>
    userDashboards.some((dashboard) => dashboard.identifier === id);

const sortDashboardsByName = (dashboards: IInsightUsageOnDashboardItem[]) =>
    _sortBy(dashboards, (item) => item.title.trim().toLowerCase());

export const getInsightUsageOnDashboards = (
    referencedDashboards: IMetadataObject[],
    allUserDashboards: IListedDashboard[],
): IInsightUsageOnDashboard => {
    const allDashboards = referencedDashboards.map(({ id, title }) => ({ id, title }));
    const accessibleDashboards = allDashboards.filter((dashboard) =>
        isUserDashboard(allUserDashboards, dashboard),
    );

    const allDashboardsCount = referencedDashboards.length;
    const inaccessibleDashboardsCount = allDashboardsCount - accessibleDashboards.length;

    return {
        accessibleDashboards: sortDashboardsByName(accessibleDashboards),
        allDashboards,
        inaccessibleDashboardsCount,
        allDashboardsCount,
    };
};

export const canSeeAllDocuments = (permissions: IWorkspacePermissions | null): boolean =>
    !permissions || permissions.canCreateDocument;

/**
 * Whether Publisher shows the user a document. A user who may create documents sees all of them. Anyone
 * else sees only the ones they can still edit: their own, unless inherited from a parent workspace.
 * Unknown permissions show the document, as Publisher does.
 */
export const isDocumentShown = (
    document: Pick<IPublisherDocumentSummaryV2, "isLocked" | "createdBy">,
    userLogin: string | undefined,
    permissions: IWorkspacePermissions | null,
): boolean => {
    if (canSeeAllDocuments(permissions)) {
        return true;
    }
    if (document.isLocked) {
        return false;
    }
    if (permissions.canManageProject) {
        return true;
    }
    return userLogin !== undefined && document.createdBy?.login === userLogin;
};

export const getAccessibleDocumentIds = (
    documents: IPublisherDocumentSummaryV2[],
    userLogin: string | undefined,
    permissions: IWorkspacePermissions | null,
): string[] =>
    documents
        .filter((document) => isDocumentShown(document, userLogin, permissions))
        .map((document) => objRefToString(document.ref));

export const getInsightUsageInDocuments = (
    referencedDocuments: IMetadataObject[],
    accessibleDocumentIds: string[],
): IInsightUsageInDocuments => {
    const accessibleDocuments = referencedDocuments
        .filter(({ id }) => accessibleDocumentIds.includes(id))
        .map(({ id, title }) => ({ id, title }));
    return {
        accessibleDocuments: _sortBy(accessibleDocuments, (item) => item.title.trim().toLowerCase()),
        inaccessibleDocumentsCount: referencedDocuments.length - accessibleDocuments.length,
        allDocumentsCount: referencedDocuments.length,
    };
};

export const EMPTY_INSIGHT_USAGE_ON_DASHBOARDS: IInsightUsageOnDashboard = {
    accessibleDashboards: [],
    allDashboards: [],
    inaccessibleDashboardsCount: 0,
    allDashboardsCount: 0,
};

export const EMPTY_INSIGHT_USAGE_IN_DOCUMENTS: IInsightUsageInDocuments = {
    accessibleDocuments: [],
    inaccessibleDocumentsCount: 0,
    allDocumentsCount: 0,
};
