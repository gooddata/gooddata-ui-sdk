// (C) 2025-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export interface IReferencesOption {
    direction: "up" | "down";
}

/**
 * @alpha
 */
export interface IReferencesResult {
    nodes: (ObjRef & { title: string; isRoot?: boolean })[];
    edges: { from: ObjRef; to: ObjRef }[];
}

/**
 * @alpha
 */
export interface IReferencesService {
    getReferences(root: ObjRef, opts?: IReferencesOption): Promise<IReferencesResult>;
}
