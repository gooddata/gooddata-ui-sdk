// (C) 2025-2026 GoodData Corporation

import { useCallback } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IAttributeElement, type ObjRef } from "@gooddata/sdk-model";

const FILTER_DETAILS_ELEMENT_LIMIT = 5;

/**
 * Creates a request handler for loading filter details (sample elements + total count).
 * Used by AttributeFilterDetailsBubble for both elements and text filter modes.
 *
 * @internal
 */
export function useFilterDetailRequestHandler(
    backend: IAnalyticalBackend,
    workspace: string,
): (labelRef: ObjRef) => Promise<{ elements: IAttributeElement[]; totalCount: number }> {
    return useCallback(
        async (labelRef: ObjRef) => {
            const result = await backend
                .workspace(workspace)
                .attributes()
                .elements()
                .forDisplayForm(labelRef)
                .withLimit(FILTER_DETAILS_ELEMENT_LIMIT)
                .query();
            return { elements: result.items, totalCount: result.totalCount };
        },
        [backend, workspace],
    );
}
