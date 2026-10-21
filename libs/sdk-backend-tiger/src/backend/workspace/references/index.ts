// (C) 2025-2026 GoodData Corporation

import { uniqBy } from "lodash-es";

import {
    ActionsApi_GetDependentEntitiesGraph,
    ActionsApi_GetDependentEntitiesGraphFromEntryPoints,
    type DependentEntitiesGraph,
    type DependentEntitiesNodeTypeEnum,
    type DependentEntitiesRequestRelationEnum,
    type EntityIdentifier,
} from "@gooddata/api-client-tiger";
import {
    type IReferencesOption,
    type IReferencesResult,
    type IReferencesService,
} from "@gooddata/sdk-backend-spi";
import { type IdentifierRef, type ObjectType, serializeObjRef } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard, type TigerObjectType } from "../../../types/index.js";
import { objectTypeToTigerIdType, tigerIdTypeToObjectType } from "../../../types/refTypeMapping.js";

const sdkObjectTypeToTigerType: Partial<Record<ObjectType, TigerObjectType>> = objectTypeToTigerIdType;

type NodeTypeMapping = Partial<Record<DependentEntitiesNodeTypeEnum, ObjectType>>;

const referenceNodeTypeToObjectType: NodeTypeMapping = tigerIdTypeToObjectType;

const workspaceGraphNodeTypeToObjectType: NodeTypeMapping = {
    ...tigerIdTypeToObjectType,
    automation: "automation",
    filterView: "filterView",
    userDataFilter: "userDataFilter",
    memoryItem: "memoryItem",
};

export class TigerReferencesService implements IReferencesService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspace: string,
    ) {}

    public async getReferences(
        root: IdentifierRef | IdentifierRef[],
        opts?: IReferencesOption,
    ): Promise<IReferencesResult> {
        const roots = Array.isArray(root) ? root : [root];
        const direction = opts?.direction;

        if (direction === "both") {
            const [dependencies, dependents] = await Promise.all([
                getGraph(this.authCall, this.workspace, roots, "DEPENDENCIES"),
                getGraph(this.authCall, this.workspace, roots, "DEPENDENTS"),
            ]);
            return mergeGraphs(dependencies, dependents);
        }

        return getGraph(
            this.authCall,
            this.workspace,
            roots,
            direction === "up" ? "DEPENDENTS" : "DEPENDENCIES",
        );
    }

    public async getAllReferences(): Promise<IReferencesResult> {
        const entitiesGraph = await this.authCall(async (client) => {
            const response = await ActionsApi_GetDependentEntitiesGraph(client.axios, client.basePath, {
                workspaceId: this.workspace,
            });
            return response.data.graph;
        });
        // The full graph has the same edge order as the graph of dependencies.
        return createGraph(entitiesGraph, new Set(), "DEPENDENCIES", workspaceGraphNodeTypeToObjectType);
    }
}

async function getGraph(
    authCall: TigerAuthenticatedCallGuard,
    workspace: string,
    roots: IdentifierRef[],
    relation: DependentEntitiesRequestRelationEnum,
): Promise<IReferencesResult> {
    const identifiers = roots.flatMap(refToEntityIdentifier);

    if (identifiers.length === 0) {
        return { nodes: [], edges: [] };
    }

    const rootKeys = new Set(identifiers.map(entityKey));

    const entitiesGraph = await authCall(async (client) => {
        const response = await ActionsApi_GetDependentEntitiesGraphFromEntryPoints(
            client.axios,
            client.basePath,
            {
                workspaceId: workspace,
                dependentEntitiesRequest: {
                    identifiers,
                    relation,
                },
            },
        );
        return response.data.graph;
    });

    return createGraph(entitiesGraph, rootKeys, relation, referenceNodeTypeToObjectType);
}

function createGraph(
    entitiesGraph: DependentEntitiesGraph,
    rootKeys: Set<string>,
    relation: DependentEntitiesRequestRelationEnum,
    nodeTypes: NodeTypeMapping,
): IReferencesResult {
    const nodes: IReferencesResult["nodes"] = entitiesGraph.nodes.flatMap((node) => {
        const ref = tigerNodeToRef(node, nodeTypes);
        if (!ref) {
            return [];
        }
        return [{ ...ref, title: node.title ?? node.id, isRoot: rootKeys.has(entityKey(node)) }];
    });

    const edges: IReferencesResult["edges"] = entitiesGraph.edges.flatMap((edge) => {
        const [from, to] = edge;
        if (!from || !to) {
            return [];
        }
        const fromRef = tigerNodeToRef(from, nodeTypes);
        const toRef = tigerNodeToRef(to, nodeTypes);
        if (!fromRef || !toRef) {
            return [];
        }
        return relation === "DEPENDENCIES" ? [{ from: toRef, to: fromRef }] : [{ from: fromRef, to: toRef }];
    });

    return { nodes, edges };
}

function mergeGraphs(a: IReferencesResult, b: IReferencesResult): IReferencesResult {
    return {
        nodes: uniqBy([...a.nodes, ...b.nodes], serializeObjRef),
        edges: uniqBy(
            [...a.edges, ...b.edges],
            (edge) => `${serializeObjRef(edge.from)}|${serializeObjRef(edge.to)}`,
        ),
    };
}

function refToEntityIdentifier(ref: IdentifierRef): EntityIdentifier[] {
    const tigerType = ref.type ? sdkObjectTypeToTigerType[ref.type] : "visualizationObject";
    return isGraphSupportedType(tigerType) ? [{ id: ref.identifier, type: tigerType }] : [];
}

function tigerNodeToRef(
    node: { id: string; type: DependentEntitiesNodeTypeEnum },
    nodeTypes: NodeTypeMapping,
): IdentifierRef | undefined {
    const type = nodeTypes[node.type];
    return type ? { identifier: node.id, type } : undefined;
}

// Prompt is not accepted by the dependency graph endpoint.
function isGraphSupportedType(
    type: TigerObjectType | undefined,
): type is Extract<TigerObjectType, EntityIdentifier["type"]> {
    return type !== undefined && type !== "prompt";
}

function entityKey(entity: { id: string; type: string }): string {
    return `${entity.type}/${entity.id}`;
}
