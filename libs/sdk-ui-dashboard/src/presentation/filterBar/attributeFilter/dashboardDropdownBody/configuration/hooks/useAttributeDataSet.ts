// (C) 2022-2023 GoodData Corporation
import { useEffect, useMemo } from "react";
import { IDataSetMetadataObject, ObjRef } from "@gooddata/sdk-model";
import {
    queryAttributeDataSet,
    QueryAttributeDataSet,
    useDashboardQueryProcessing,
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

    useEffect(() => {
        if (loadQuery) {
            getAttributeDataSet(displayForm);
        }
    }, [displayForm, loadQuery, getAttributeDataSet]);

    const attributesDataSetLoading = useMemo(() => {
        return attributesDataSetLoadingStatus === "pending" || attributesDataSetLoadingStatus === "running";
    }, [attributesDataSetLoadingStatus]);

    return {
        attributeDataSet,
        attributesDataSetLoading,
        attributesDataSetLoadingError,
    };
}
