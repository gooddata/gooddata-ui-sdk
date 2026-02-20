// (C) 2025-2026 GoodData Corporation

import { type IReferencesResult } from "@gooddata/sdk-backend-spi";
import { type ObjRef, type ObjectType, isIdentifierRef } from "@gooddata/sdk-model";

export function objRefToId(objRef: ObjRef) {
    if (isIdentifierRef(objRef)) {
        if (objRef.type) {
            return `${objRef.type}/${objRef.identifier}`;
        }
        return objRef.identifier;
    }
    return objRef.uri;
}

export function objRefToType(objRef: ObjRef) {
    if (isIdentifierRef(objRef)) {
        if (objRef.type) {
            return objRef.type;
        }
    }
    return "unknown";
}

export function filterNodes(
    nodes: IReferencesResult["nodes"],
    edges: IReferencesResult["edges"],
    typesToFilter?: ObjectType[],
): { nodes: IReferencesResult["nodes"]; edges: IReferencesResult["edges"] } {
    if (!typesToFilter) {
        return { nodes, edges };
    }

    const filteredNodes = nodes.filter(
        (node) => !typesToFilter.includes(objRefToType(node) as ObjectType) || node.isRoot,
    );

    const nodesToRemove = nodes.filter(
        (node) => typesToFilter.includes(objRefToType(node) as ObjectType) && !node.isRoot,
    );
    const nodesToRemoveIds = nodesToRemove.map(objRefToId);

    let currentEdges = [...edges];

    nodesToRemoveIds.forEach((nodeId) => {
        const incomingEdges = currentEdges.filter((edge) => objRefToId(edge.to) === nodeId);
        const outgoingEdges = currentEdges.filter((edge) => objRefToId(edge.from) === nodeId);

        // Create new edges reconnecting parents to children
        incomingEdges.forEach((incoming) => {
            outgoingEdges.forEach((outgoing) => {
                // Check if this edge already exists to avoid duplicates
                const exists = currentEdges.some(
                    (e) =>
                        objRefToId(e.from) === objRefToId(incoming.from) &&
                        objRefToId(e.to) === objRefToId(outgoing.to),
                );
                if (!exists) {
                    currentEdges.push({
                        from: incoming.from,
                        to: outgoing.to,
                    });
                }
            });
        });

        // Remove edges connected to the filtered node
        currentEdges = currentEdges.filter(
            (edge) => objRefToId(edge.from) !== nodeId && objRefToId(edge.to) !== nodeId,
        );
    });

    return {
        nodes: filteredNodes,
        edges: currentEdges,
    };
}

export function filterLeafNodes(
    nodes: IReferencesResult["nodes"],
    edges: IReferencesResult["edges"],
    typesToFilter?: ObjectType[],
): { nodes: IReferencesResult["nodes"]; edges: IReferencesResult["edges"] } {
    if (!typesToFilter || typesToFilter.length === 0) {
        return { nodes, edges };
    }

    const nodesToRemoveIds = new Set<string>();

    nodes.forEach((node) => {
        const type = objRefToType(node) as ObjectType;
        if (typesToFilter.includes(type)) {
            const nodeId = objRefToId(node);
            const outgoingEdges = edges.filter((edge) => objRefToId(edge.from) === nodeId);
            outgoingEdges.forEach((edge) => {
                const toId = objRefToId(edge.to);
                const toOutgoingEdges = edges.filter((e) => objRefToId(e.from) === toId);
                const toIncomingEdges = edges.filter((e) => objRefToId(e.to) === toId);

                // We want to remove the leaf node only if ALL its parents are within the filtered types
                const areAllParentsFiltered = toIncomingEdges.every((e) => {
                    const fromNode = nodes.find((n) => objRefToId(n) === objRefToId(e.from));
                    return fromNode && typesToFilter.includes(objRefToType(fromNode) as ObjectType);
                });

                if (toOutgoingEdges.length === 0 && areAllParentsFiltered) {
                    nodesToRemoveIds.add(toId);
                }
            });
        }
    });

    const filteredNodes = nodes.filter((node) => !nodesToRemoveIds.has(objRefToId(node)));
    const filteredEdges = edges.filter(
        (edge) => !nodesToRemoveIds.has(objRefToId(edge.from)) && !nodesToRemoveIds.has(objRefToId(edge.to)),
    );

    return {
        nodes: filteredNodes,
        edges: filteredEdges,
    };
}
