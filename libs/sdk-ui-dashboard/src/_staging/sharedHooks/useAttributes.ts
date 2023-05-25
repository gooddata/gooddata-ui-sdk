// (C) 2022 GoodData Corporation
import { useEffect, useMemo } from "react";
import { IAttributeMetadataObject, ObjRef } from "@gooddata/sdk-model";
import {
    queryAttributeByDisplayForm,
    QueryAttributeByDisplayForm,
    useDashboardQueryProcessing,
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

    useEffect(() => {
        getAttributes(displayForms);
    }, [displayForms, getAttributes]);

    const attributesLoading = useMemo(() => {
        return attributesLoadingStatus === "pending" || attributesLoadingStatus === "running";
    }, [attributesLoadingStatus]);

    return {
        attributes,
        attributesLoading,
        attributesLoadingError,
    };
}
