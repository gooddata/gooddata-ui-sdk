// (C) 2022-2023 GoodData Corporation

import { IDashboardMetadataObject, idRef } from "@gooddata/sdk-model";

interface IGraphNode {
    id: string;
    type: string;
    title?: string;
}

/**
 * Graph entities do not hold uri information, so if uri is needed, it has
 * to be constructed from object id somehow.
 */
export const convertGraphEntityNodeToAnalyticalDashboard = (node: IGraphNode): IDashboardMetadataObject => {
    return {
        id: node.id,
        ref: idRef(node.id, "analyticalDashboard"),
        type: "analyticalDashboard",
        title: node.title ?? node.id,
        uri: "",
        description: "",
        production: false,
        unlisted: false,
        deprecated: false,
    };
};
