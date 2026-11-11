// (C) 2025-2026 GoodData Corporation

import { useCallback } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IAttributeElement, type ISeparators, type ObjRef } from "@gooddata/sdk-model";

import { formatElementTitles } from "../../AttributeFilterHandler/internal/redux/elements/formatElementTitles.js";

const FILTER_DETAILS_ELEMENT_LIMIT = 5;

/**
 * Creates a request handler for loading filter details (sample elements + total count).
 * Used by AttributeFilterDetailsBubble for both elements and text filter modes. Values of a numeric
 * computed attribute get a formatted title by the number format of the query and the separators.
 *
 * @internal
 */
export function useFilterDetailRequestHandler(
    backend: IAnalyticalBackend,
    workspace: string,
    separators?: ISeparators,
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
            return {
                elements: formatElementTitles(result.items, result.numberFormat, separators),
                totalCount: result.totalCount,
            };
        },
        [backend, workspace, separators],
    );
}
