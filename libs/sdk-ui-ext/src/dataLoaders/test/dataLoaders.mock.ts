// (C) 2020-2021 GoodData Corporation
import noop from "lodash/noop";
import { IWorkspaceInsightsService } from "@gooddata/sdk-backend-spi";

export const noopWorkspaceDashboardsService: IWorkspaceInsightsService = {
    createInsight: noop as any,
    deleteInsight: noop as any,
    getInsight: noop as any,
    getInsightReferencedObjects: noop as any,
    getInsightReferencingObjects: noop as any,
    getInsightWithAddedFilters: noop as any,
    getInsights: noop as any,
    getVisualizationClass: noop as any,
    getVisualizationClasses: noop as any,
    updateInsight: noop as any,
};
