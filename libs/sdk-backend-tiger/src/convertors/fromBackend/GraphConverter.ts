// (C) 2022 GoodData Corporation

import { IDashboardMetadataObject, idRef } from "@gooddata/sdk-model";

interface IGraphNode {
    id: string;
    type: string;
    title?: string;
}

const constructAnalyticalDashboardUri = (workspaceId: string, dashboardId: string) =>
    `/api/v1/workspaces/${workspaceId}/analyticalDashboards/${dashboardId}`;

export const convertGraphEntityNodeToAnalyticalDashboard = (
    node: IGraphNode,
    workspaceId: string,
): IDashboardMetadataObject => {
    return {
        id: node.id,
        ref: idRef(node.id, "analyticalDashboard"),
        type: "analyticalDashboard",
        title: node.title ?? node.id,
        uri: constructAnalyticalDashboardUri(workspaceId, node.id),
        description: "",
        production: false,
        unlisted: false,
        deprecated: false,
    };
};
