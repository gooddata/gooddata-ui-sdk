// (C) 2022-2023 GoodData Corporation
import { useEffect, useMemo } from "react";
import { IDataSetMetadataObject, ObjRef } from "@gooddata/sdk-model";
import {
    queryAttributeDataSet,
    QueryAttributeDataSet,
    useDashboardQueryProcessing,
} from "../../../../../../model";

/**
 * @internal
 */
export function useAttributeDataSet(displayForm: ObjRef) {
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
        getAttributeDataSet(displayForm);
    }, [displayForm, getAttributeDataSet]);

    const attributesDataSetLoading = useMemo(() => {
        return attributesDataSetLoadingStatus === "pending" || attributesDataSetLoadingStatus === "running";
    }, [attributesDataSetLoadingStatus]);

    return {
        attributeDataSet,
        attributesDataSetLoading,
        attributesDataSetLoadingError,
    };
}
