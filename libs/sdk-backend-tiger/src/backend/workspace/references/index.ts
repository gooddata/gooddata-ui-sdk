// (C) 2025-2026 GoodData Corporation

import {
    ActionsApi_GetDependentEntitiesGraphFromEntryPoints,
    type DependentEntitiesGraph,
    type DependentEntitiesRequestRelationEnum,
    type EntityIdentifierTypeEnum,
} from "@gooddata/api-client-tiger";
import {
    type IReferencesOption,
    type IReferencesResult,
    type IReferencesService,
} from "@gooddata/sdk-backend-spi";
import { type ObjRef, areObjRefsEqual, isIdentifierRef } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard, type TigerObjectType } from "../../../types/index.js";
import {
    type TigerCompatibleObjectType,
    objectTypeToTigerIdType,
    tigerIdTypeToObjectType,
} from "../../../types/refTypeMapping.js";
import { objRefToIdentifier } from "../../../utils/api.js";

export class TigerReferencesService implements IReferencesService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspace: string,
    ) {}

    public async getReferences(root: ObjRef, opts?: IReferencesOption): Promise<IReferencesResult> {
        const id = objRefToIdentifier(root, this.authCall);
        const type =
            isIdentifierRef(root) && root.type
                ? objectTypeToTigerIdType[root.type as TigerCompatibleObjectType]
                : "visualizationObject";

        // Prompt is not supported.
        if (type === "prompt") {
            return {
                nodes: [],
                edges: [],
            };
        }

        if (opts?.direction === "both") {
            const dependenciesGraph = await getData(this.authCall, this.workspace, id, type, "DEPENDENCIES");
            const dependentsGraph = await getData(this.authCall, this.workspace, id, type, "DEPENDENTS");

            const graph = mergeGraphs(dependenciesGraph, dependentsGraph, root);
            return {
                nodes: graph.nodes,
                edges: revertGraphDirection(graph.edges, opts),
            };
        } else {
            const entitiesGraph = await getData(
                this.authCall,
                this.workspace,
                id,
                type,
                opts?.direction === "up" ? "DEPENDENTS" : "DEPENDENCIES",
            );

            const graph = createGraph(entitiesGraph, root);
            return {
                nodes: graph.nodes,
                edges: revertGraphDirection(graph.edges, opts),
            };
        }
    }
}

async function getData(
    authCall: TigerAuthenticatedCallGuard,
    workspace: string,
    id: string,
    type: EntityIdentifierTypeEnum,
    direction: DependentEntitiesRequestRelationEnum,
) {
    return await authCall((client) =>
        ActionsApi_GetDependentEntitiesGraphFromEntryPoints(client.axios, client.basePath, {
            workspaceId: workspace,
            dependentEntitiesRequest: {
                identifiers: [{ id, type }],
                relation: direction,
            },
        }).then((res) => res.data.graph),
    );
}

function mergeGraphs(
    dependenciesGraph: DependentEntitiesGraph,
    dependentsGraph: DependentEntitiesGraph,
    root: ObjRef,
) {
    const dependencies = createGraph(dependenciesGraph, root);
    const dependents = createGraph(dependentsGraph, root);

    const nodes = [...dependencies.nodes];
    dependents.nodes.forEach((node) => {
        if (!nodes.some((n) => areObjRefsEqual(n, node))) {
            nodes.push(node);
        }
    });

    const edges = [...dependencies.edges];
    dependents.edges.forEach((edge) => {
        if (!edges.some((e) => areObjRefsEqual(e.from, edge.from) && areObjRefsEqual(e.to, edge.to))) {
            edges.push(edge);
        }
    });

    return {
        nodes,
        edges,
    };
}

function createGraph(entitiesGraph: DependentEntitiesGraph, root: ObjRef) {
    const nodes: IReferencesResult["nodes"] = [];
    entitiesGraph.nodes.forEach((node) => {
        const ref = createRef(node.id, node.type as TigerObjectType);
        nodes.push({
            ...ref,
            title: node.title ?? node.id,
            isRoot: areObjRefsEqual(ref, root),
        });
    });
    const edges: IReferencesResult["edges"] = [];
    entitiesGraph.edges.forEach(([from, to]) => {
        edges.push({
            from: createRef(from.id, from.type as TigerObjectType),
            to: createRef(to.id, to.type as TigerObjectType),
        });
    });

    return {
        nodes,
        edges,
    };
}

function revertGraphDirection(edges: IReferencesResult["edges"], opts?: IReferencesOption) {
    const direction = opts?.direction ?? "down";

    if (direction === "down" || direction === "both") {
        return edges.map((edge) => ({ from: edge.to, to: edge.from }));
    }
    return edges;
}

function createRef(id: string, type: TigerObjectType): ObjRef {
    return {
        identifier: id,
        type: tigerIdTypeToObjectType[type],
    };
}
