// (C) 2022-2025 GoodData Corporation
import { useEffect, useMemo } from "react";
import { IAttributeMetadataObject, ObjRef } from "@gooddata/sdk-model";
import {
    queryAttributeByDisplayForm,
    QueryAttributeByDisplayForm,
    useDashboardQueryProcessing,
    selectPreloadedAttributesWithReferences,
    useDashboardSelector,
    selectIsNewDashboard,
} from "../../model/index.js";

/**
 * @internal
 */
export function useAttributes(displayForms: ObjRef[]) {
    const {
        run: getAttributes,
        result: attributes,
        status: attributesLoadingStatus,
        error: attributesLoadingError,
    } = useDashboardQueryProcessing<
        QueryAttributeByDisplayForm,
        IAttributeMetadataObject[],
        Parameters<typeof queryAttributeByDisplayForm>
    >({
        queryCreator: queryAttributeByDisplayForm,
    });

    // First wait for preloaded filter attributes, otherwise we might be spawning lot of unnecessary requests
    const attributesWithReferences = useDashboardSelector(selectPreloadedAttributesWithReferences);
    const isNewDashboard = useDashboardSelector(selectIsNewDashboard);

    useEffect(() => {
        const shouldLoad = isNewDashboard || attributesWithReferences;
        if (shouldLoad) {
            getAttributes(displayForms);
        }
    }, [displayForms, getAttributes, isNewDashboard, attributesWithReferences]);

    const attributesLoading = useMemo(() => {
        return attributesLoadingStatus === "pending" || attributesLoadingStatus === "running";
    }, [attributesLoadingStatus]);

    return {
        attributes,
        attributesLoading,
        attributesLoadingError,
    };
}
