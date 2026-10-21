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

    /**
     * Returns the references between all objects of the workspace.
     *
     * @remarks
     * Each edge goes from the object that uses another object to the object that it uses.
     * The result has no root nodes.
     */
    getAllReferences(): Promise<IReferencesResult>;
}
