// (C) 2022 GoodData Corporation
import { useEffect, useMemo } from "react";
import { ObjRef } from "@gooddata/sdk-model";
import {
    IConnectingAttribute,
    queryConnectingAttributes,
    QueryConnectingAttributes,
    useDashboardQueryProcessing,
} from "../../../../../../model";

/**
 * @internal
 */
export function useConnectingAttributes(
    currentFilterDisplayForm: ObjRef,
    neighborFiltersDisplayForms: ObjRef[],
) {
    const pairs: [ObjRef, ObjRef][] = useMemo(
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
        getConnectingAttributes(pairs);
    }, [pairs, getConnectingAttributes]);

    const connectingAttributesLoading = useMemo(() => {
        return connectingAttributesStatus === "pending" || connectingAttributesStatus === "running";
    }, [connectingAttributesStatus]);

    return {
        connectingAttributes,
        connectingAttributesLoading,
        connectingAttributesError,
    };
}
