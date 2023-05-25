// (C) 2022 GoodData Corporation
import { useEffect, useMemo } from "react";
import { ObjRef } from "@gooddata/sdk-model";
import {
    IConnectingAttribute,
    queryConnectingAttributes,
    QueryConnectingAttributes,
    useDashboardQueryProcessing,
    selectSupportsElementsQueryParentFiltering,
    useDashboardSelector,
} from "../../../../../../model/index.js";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

interface IUseConnectingAttributesResult {
    connectingAttributes: IConnectingAttribute[][] | undefined;
    connectingAttributesLoading: boolean;
    connectingAttributesError: GoodDataSdkError | undefined;
}

/**
 * @internal
 */
export function useConnectingAttributes(
    currentFilterDisplayForm: ObjRef,
    neighborFiltersDisplayForms: ObjRef[],
): IUseConnectingAttributesResult {
    const isDependentFiltersEnabled = useDashboardSelector(selectSupportsElementsQueryParentFiltering);

    const pairs = useMemo<[ObjRef, ObjRef][]>(
        () =>
            neighborFiltersDisplayForms.map((neighborDisplayForm) => [
                currentFilterDisplayForm,
                neighborDisplayForm,
            ]),
        [neighborFiltersDisplayForms, currentFilterDisplayForm],
    );

    const {
        run: getConnectingAttributes,
        result: connectingAttributes,
        status: connectingAttributesStatus,
        error: connectingAttributesError,
    } = useDashboardQueryProcessing<
        QueryConnectingAttributes,
        IConnectingAttribute[][],
        Parameters<typeof queryConnectingAttributes>
    >({
        queryCreator: queryConnectingAttributes,
    });

    useEffect(() => {
        // if the backend does not support the parent attributes, we must not run the query, it will end in an error
        if (isDependentFiltersEnabled) {
            getConnectingAttributes(pairs);
        }
    }, [pairs, getConnectingAttributes, isDependentFiltersEnabled]);

    const connectingAttributesLoading = useMemo(() => {
        return connectingAttributesStatus === "pending" || connectingAttributesStatus === "running";
    }, [connectingAttributesStatus]);

    if (!isDependentFiltersEnabled) {
        // if the backend does not support the parent attributes, return en empty response
        return {
            connectingAttributes: [],
            connectingAttributesError: undefined,
            connectingAttributesLoading: false,
        };
    }

    return {
        connectingAttributes,
        connectingAttributesLoading,
        connectingAttributesError,
    };
}
