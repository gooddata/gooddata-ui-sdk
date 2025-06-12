// (C) 2023 GoodData Corporation
import { useEffect, useMemo } from "react";
import { ObjRef } from "@gooddata/sdk-model";
import {
    QueryAttributeElements,
    queryAttributeElements,
    useDashboardQueryProcessing,
    IUseAttributeElements,
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
