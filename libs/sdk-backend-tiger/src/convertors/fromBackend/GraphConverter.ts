// (C) 2022-2026 GoodData Corporation

import {
    type IDashboardMetadataObject,
    type IMetadataObject,
    type ObjectType,
    idRef,
} from "@gooddata/sdk-model";

interface IGraphNode {
    id: string;
    type: string;
    title?: string;
}

/**
 * Graph entities do not hold uri information, so if uri is needed, it has
 * to be constructed from object id somehow.
 */
const convertGraphEntityNode = <T extends ObjectType>(
    node: IGraphNode,
    type: T,
): IMetadataObject & { type: T } => {
    return {
        id: node.id,
        ref: idRef(node.id, type),
        type,
        title: node.title ?? node.id,
        uri: "",
        description: "",
        production: false,
        unlisted: false,
        deprecated: false,
    };
};

export const convertGraphEntityNodeToAnalyticalDashboard = (node: IGraphNode): IDashboardMetadataObject => {
    return convertGraphEntityNode(node, "analyticalDashboard");
};

export const convertGraphEntityNodeToDocument = (node: IGraphNode): IMetadataObject => {
    return convertGraphEntityNode(node, "document");
};
