// (C) 2023-2026 GoodData Corporation

import { useEffect, useMemo } from "react";

import { type ObjRef } from "@gooddata/sdk-model";

import {
    type IQueryAttributeElements,
    queryAttributeElements,
} from "../../../../../../model/queries/attributeElements.js";
import { useDashboardQueryProcessing } from "../../../../../../model/react/useDashboardQueryProcessing.js";
import { type IUseAttributeElements } from "../../../../../../model/types/attributeFilterTypes.js";

/**
 * @internal
 */
export function useAttributeElements(displayForm: ObjRef, limit?: number, loadQuery?: boolean) {
    const {
        run: getAttributeElements,
        result: attributeElements,
        status: attributeElementsLoadingStatus,
        error: attributeElementsLoadingError,
    } = useDashboardQueryProcessing<
        IQueryAttributeElements,
        IUseAttributeElements,
        Parameters<typeof queryAttributeElements>
    >({
        queryCreator: queryAttributeElements,
    });

    useEffect(() => {
        if (loadQuery) {
            getAttributeElements(displayForm, limit);
        }
    }, [displayForm, loadQuery, limit, getAttributeElements]);

    const attributesElementsLoading = useMemo(() => {
        return attributeElementsLoadingStatus === "pending" || attributeElementsLoadingStatus === "running";
    }, [attributeElementsLoadingStatus]);

    return {
        attributeElements,
        attributesElementsLoading,
        attributeElementsLoadingError,
    };
}
