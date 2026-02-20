// (C) 2025-2026 GoodData Corporation

import { ActionsApi_GetDependentEntitiesGraphFromEntryPoints } from "@gooddata/api-client-tiger";
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

        const entitiesGraph = await this.authCall((client) =>
            ActionsApi_GetDependentEntitiesGraphFromEntryPoints(client.axios, client.basePath, {
                workspaceId: this.workspace,
                dependentEntitiesRequest: {
                    identifiers: [{ id, type }],
                    relation: opts?.direction === "up" ? "DEPENDENTS" : "DEPENDENCIES",
                },
            }).then((res) => res.data.graph),
        );

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
            edges: revertGraphDirection(edges, opts),
        };
    }
}

function revertGraphDirection(edges: IReferencesResult["edges"], opts?: IReferencesOption) {
    const direction = opts?.direction ?? "down";

    if (direction === "down") {
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
