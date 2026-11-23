// (C) 2020-2026 GoodData Corporation

import { type IPublisherDocumentSummaryV2 } from "@gooddata/sdk-backend-spi";
import {
    type IListedDashboard,
    type IMetadataObject,
    type IWorkspacePermissions,
    type ObjectType,
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
 * The ids of the documents the user may open. The backend returns only the documents the user may see.
 */
export const getAccessibleDocumentIds = (documents: IPublisherDocumentSummaryV2[]): string[] =>
    documents.map((document) => objRefToString(document.ref));

const templateTypes: ObjectType[] = ["documentTemplate", "pageTemplate"];

export const isDocument = ({ type }: { type: ObjectType }): boolean => type === "document";

export const isTemplate = ({ type }: { type: ObjectType }): boolean => templateTypes.includes(type);

/**
 * Every user sees every template, so only documents can be hidden from the user.
 */
export const getInsightUsageInDocuments = (
    referencedDocuments: IMetadataObject[],
    accessibleDocumentIds: string[],
): IInsightUsageInDocuments => {
    const accessibleDocuments = referencedDocuments
        .filter((item) => isTemplate(item) || accessibleDocumentIds.includes(item.id))
        .map(({ id, title, type }) => ({ id, title, type }));
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
