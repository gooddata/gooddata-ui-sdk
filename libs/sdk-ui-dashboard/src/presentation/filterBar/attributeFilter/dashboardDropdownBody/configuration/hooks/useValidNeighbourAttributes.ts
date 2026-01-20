// (C) 2023-2026 GoodData Corporation

import { useEffect, useMemo } from "react";

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import {
    type IQueryConnectedAttributes,
    queryConnectedAttributes,
    selectAttributeFilterDisplayFormsMap,
    selectSupportsSettingConnectingAttributes,
    useDashboardQueryProcessing,
    useDashboardSelector,
} from "../../../../../../model/index.js";

interface IUseValidNeighbourAttributesResult {
    validNeighbourAttributes: ObjRef[];
    validNeighbourAttributesLoading: boolean;
    validNeighbourAttributesError: GoodDataSdkError | undefined;
}

/**
 * Returns neighbor attribute filter display forms that have a valid connection in model with provided attribute display form.
 * This should only be used when we don't need to look for connecting attributes and just need the information whether
 * some connection exists.
 */
export const useValidNeighbourAttributes = (
    attributeFilterDisplayForm: ObjRef,
    neighbourFilterDisplayForms: ObjRef[],
): IUseValidNeighbourAttributesResult => {
    const supportsSettingConnectingAttributes = useDashboardSelector(
        selectSupportsSettingConnectingAttributes,
    );
    const shouldValidateNeighbourAttributes = !supportsSettingConnectingAttributes;
    const neighbourFilterDisplayFormsMap = useDashboardSelector(selectAttributeFilterDisplayFormsMap);

    const {
        run: getValidAttributes,
        result: validAttributes,
        status: validAttributesStatus,
        error: validAttributesError,
    } = useDashboardQueryProcessing<
        IQueryConnectedAttributes,
        ObjRef[],
        Parameters<typeof queryConnectedAttributes>
    >({
        queryCreator: queryConnectedAttributes,
    });

    useEffect(() => {
        if (shouldValidateNeighbourAttributes) {
            getValidAttributes(attributeFilterDisplayForm);
        }
    }, [attributeFilterDisplayForm, getValidAttributes, shouldValidateNeighbourAttributes]);

    const validAttributesLoading = useMemo(() => {
        return validAttributesStatus === "pending" || validAttributesStatus === "running";
    }, [validAttributesStatus]);

    if (!shouldValidateNeighbourAttributes) {
        return {
            validNeighbourAttributes: [],
            validNeighbourAttributesLoading: false,
            validNeighbourAttributesError: undefined,
        };
    }

    /**
     * Filter out attributes that are not in the list of valid attributes.
     * At the beginning we have only display forms, so we need to get the attribute ref from the display form.
     * Then compare the attribute ref with the list of valid attributes.
     */
    const validNeighbourAttributes = neighbourFilterDisplayForms.filter((neighbourFilterDisplayForm) => {
        const neighbourAttribute = neighbourFilterDisplayFormsMap.get(neighbourFilterDisplayForm)?.attribute;

        return (
            validAttributes?.some((validAttributeRef) =>
                areObjRefsEqual(neighbourAttribute, validAttributeRef),
            ) ?? false
        );
    });

    return {
        validNeighbourAttributes: validNeighbourAttributes,
        validNeighbourAttributesLoading: validAttributesLoading,
        validNeighbourAttributesError: validAttributesError,
    };
};
