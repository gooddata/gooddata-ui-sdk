// (C) 2023-2025 GoodData Corporation
import { useEffect, useMemo } from "react";

import { type ObjRef } from "@gooddata/sdk-model";

import {
    type IUseAttributeElements,
    type QueryAttributeElements,
    queryAttributeElements,
    useDashboardQueryProcessing,
} from "../../../../../../model/index.js";

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
        QueryAttributeElements,
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
