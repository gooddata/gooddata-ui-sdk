// (C) 2022-2025 GoodData Corporation
import { useEffect, useMemo } from "react";

import { IDataSetMetadataObject, ObjRef } from "@gooddata/sdk-model";

import {
    QueryAttributeDataSet,
    queryAttributeDataSet,
    selectIsNewDashboard,
    selectPreloadedAttributesWithReferences,
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
    const isNewDashboard = useDashboardSelector(selectIsNewDashboard);

    useEffect(() => {
        const shouldLoad = isNewDashboard || attributesWithReferences;
        if (loadQuery && shouldLoad) {
            getAttributeDataSet(displayForm);
        }
    }, [displayForm, isNewDashboard, loadQuery, getAttributeDataSet, attributesWithReferences]);

    const attributesDataSetLoading = useMemo(() => {
        return attributesDataSetLoadingStatus === "pending" || attributesDataSetLoadingStatus === "running";
    }, [attributesDataSetLoadingStatus]);

    return {
        attributeDataSet,
        attributesDataSetLoading,
        attributesDataSetLoadingError,
    };
}
