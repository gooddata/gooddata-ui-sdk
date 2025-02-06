// (C) 2022-2025 GoodData Corporation
import { useEffect, useMemo } from "react";
import { IDataSetMetadataObject, ObjRef } from "@gooddata/sdk-model";
import {
    queryAttributeDataSet,
    QueryAttributeDataSet,
    selectPreloadedAttributesWithReferences,
    selectEnableCriticalContentPerformanceOptimizations,
    useDashboardQueryProcessing,
    useDashboardSelector,
} from "../../../../../../model/index.js";

/**
 * @internal
 */
export function useAttributeDataSet(displayForm: ObjRef, loadQuery = true) {
    const {
        run: getAttributeDataSet,
        result: attributeDataSet,
        status: attributesDataSetLoadingStatus,
        error: attributesDataSetLoadingError,
    } = useDashboardQueryProcessing<
        QueryAttributeDataSet,
        IDataSetMetadataObject,
        Parameters<typeof queryAttributeDataSet>
    >({
        queryCreator: queryAttributeDataSet,
    });

    // First wait for preloaded filter attributes, otherwise we might be spawning lot of unnecessary requests
    const attributesWithReferences = useDashboardSelector(selectPreloadedAttributesWithReferences);
    const enablePerfOptimizations = useDashboardSelector(selectEnableCriticalContentPerformanceOptimizations);

    useEffect(() => {
        const shouldLoad = enablePerfOptimizations ? attributesWithReferences : true;
        if (loadQuery && shouldLoad) {
            getAttributeDataSet(displayForm);
        }
    }, [displayForm, loadQuery, getAttributeDataSet, enablePerfOptimizations, attributesWithReferences]);

    const attributesDataSetLoading = useMemo(() => {
        return attributesDataSetLoadingStatus === "pending" || attributesDataSetLoadingStatus === "running";
    }, [attributesDataSetLoadingStatus]);

    return {
        attributeDataSet,
        attributesDataSetLoading,
        attributesDataSetLoadingError,
    };
}
