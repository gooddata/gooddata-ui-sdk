// (C) 2025 GoodData Corporation
import { useId } from "react";

/**
 * Generates unique IDs for the semantic search.
 * @internal
 */
export function useSearchIds() {
    const id = useId();
    const inputId = `semantic-search/${id}/input`;
    const treeViewId = `semantic-search/${id}/treeview`;
    return { inputId, treeViewId };
}
