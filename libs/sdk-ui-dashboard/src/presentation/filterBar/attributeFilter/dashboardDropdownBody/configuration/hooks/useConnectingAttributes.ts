// (C) 2022-2026 GoodData Corporation

import { useEffect, useMemo } from "react";

import { type ObjRef } from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import {
    type IQueryConnectingAttributes,
    queryConnectingAttributes,
} from "../../../../../../model/queries/connectingAttributes.js";
import { useDashboardSelector } from "../../../../../../model/react/DashboardStoreProvider.js";
import { useDashboardQueryProcessing } from "../../../../../../model/react/useDashboardQueryProcessing.js";
import { selectSupportsSettingConnectingAttributes } from "../../../../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import { type IConnectingAttribute } from "../../../../../../model/types/attributeFilterTypes.js";

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
    const shouldLoadConnectingAttributes = useDashboardSelector(selectSupportsSettingConnectingAttributes);

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
        IQueryConnectingAttributes,
        IConnectingAttribute[][],
        Parameters<typeof queryConnectingAttributes>
    >({
        queryCreator: queryConnectingAttributes,
    });

    useEffect(() => {
        // if the backend does not support the parent attributes, we must not run the query, it will end in an error
        if (shouldLoadConnectingAttributes) {
            getConnectingAttributes(pairs);
        }
    }, [pairs, getConnectingAttributes, shouldLoadConnectingAttributes]);

    const connectingAttributesLoading = useMemo(() => {
        return connectingAttributesStatus === "pending" || connectingAttributesStatus === "running";
    }, [connectingAttributesStatus]);

    if (!shouldLoadConnectingAttributes) {
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
