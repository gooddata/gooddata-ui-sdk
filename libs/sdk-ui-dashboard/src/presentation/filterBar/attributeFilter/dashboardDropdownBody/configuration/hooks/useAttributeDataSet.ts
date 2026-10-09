// (C) 2022-2026 GoodData Corporation

import { useEffect, useMemo } from "react";

import { type IDataSetMetadataObject, type ObjRef } from "@gooddata/sdk-model";

import {
    type IQueryAttributeDataSet,
    queryAttributeDataSet,
} from "../../../../../../model/queries/attributeDataSet.js";
import { useDashboardSelector } from "../../../../../../model/react/DashboardStoreProvider.js";
import { useDashboardQueryProcessing } from "../../../../../../model/react/useDashboardQueryProcessing.js";
import { selectIsAiMode } from "../../../../../../model/store/config/configSelectors.js";
import { selectIsNewDashboard } from "../../../../../../model/store/meta/metaSelectors.js";
import { selectPreloadedAttributesWithReferences } from "../../../../../../model/store/tabs/filterContext/filterContextSelectors.js";

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
        IQueryAttributeDataSet,
        IDataSetMetadataObject,
        Parameters<typeof queryAttributeDataSet>
    >({
        queryCreator: queryAttributeDataSet,
    });

    // First wait for preloaded filter attributes, otherwise we might be spawning lot of unnecessary requests
    const attributesWithReferences = useDashboardSelector(selectPreloadedAttributesWithReferences);
    const isNewDashboard = useDashboardSelector(selectIsNewDashboard);
    const isAiMode = useDashboardSelector(selectIsAiMode);

    useEffect(() => {
        const shouldLoad = isNewDashboard || isAiMode || attributesWithReferences;
        if (loadQuery && shouldLoad) {
            getAttributeDataSet(displayForm);
        }
    }, [displayForm, isNewDashboard, isAiMode, loadQuery, getAttributeDataSet, attributesWithReferences]);

    const attributesDataSetLoading = useMemo(() => {
        return attributesDataSetLoadingStatus === "pending" || attributesDataSetLoadingStatus === "running";
    }, [attributesDataSetLoadingStatus]);

    return {
        attributeDataSet,
        attributesDataSetLoading,
        attributesDataSetLoadingError,
    };
}
