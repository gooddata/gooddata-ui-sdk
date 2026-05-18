// (C) 2025-2026 GoodData Corporation

import { type IdentifierRef } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export interface IReferencesOption {
    direction: "up" | "down" | "both";
}

/**
 * @alpha
 */
export interface IReferencesResult {
    nodes: (IdentifierRef & { title: string; isRoot?: boolean })[];
    edges: { from: IdentifierRef; to: IdentifierRef }[];
}

/**
 * @alpha
 */
export interface IReferencesService {
    getReferences(
        root: IdentifierRef | IdentifierRef[],
        opts?: IReferencesOption,
    ): Promise<IReferencesResult>;
}
