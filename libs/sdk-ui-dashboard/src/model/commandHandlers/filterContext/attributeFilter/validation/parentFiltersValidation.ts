// (C) 2021-2026 GoodData Corporation

import { differenceBy, zip } from "lodash-es";

import {
    type DashboardAttributeFilterItem,
    type IAttributeDisplayFormMetadataObject,
    type IDashboardAttributeFilterParent,
    type ObjRef,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemLocalIdentifier,
    objRefToString,
} from "@gooddata/sdk-model";

import { type ObjRefMap } from "../../../../../_staging/metadata/objRefMap.js";
import { type DashboardContext } from "../../../../types/commonTypes.js";

export type AttributeFilterParentsValidationResult =
    | "VALID"
    | "EXTRANEOUS_PARENT"
    | "INVALID_CONNECTION"
    | "INVALID_METADATA";

export async function validateAttributeFilterParents(
    ctx: DashboardContext,
    dashboardFilter: DashboardAttributeFilterItem,
    parents: IDashboardAttributeFilterParent[],
    allFilters: DashboardAttributeFilterItem[],
    displayFormsMap: ObjRefMap<IAttributeDisplayFormMetadataObject>,
): Promise<AttributeFilterParentsValidationResult> {
    const dashboardFilterDisplayForm = dashboardAttributeFilterItemDisplayForm(dashboardFilter);

    const allExceptValidated = allFilters.filter(
        (item) => !areObjRefsEqual(dashboardAttributeFilterItemDisplayForm(item), dashboardFilterDisplayForm),
    );

    // first, validate that the parents only use the filters that are available
    const allExceptValidatedLocalIds = allExceptValidated.map((item) =>
        dashboardAttributeFilterItemLocalIdentifier(item),
    );
    const hasExtraneousParent = parents.some(
        (parent) => !allExceptValidatedLocalIds.includes(parent.filterLocalIdentifier),
    );
    if (hasExtraneousParent) {
        return "EXTRANEOUS_PARENT";
    }

    // then validate that the connecting attributes are valid
    const parentValidationData = parents.map((parent) => {
        const parentFilter = allExceptValidated.find(
            (item) => dashboardAttributeFilterItemLocalIdentifier(item) === parent.filterLocalIdentifier,
        )!; // the ! is cool here, we validated that the parents are available in the code above

        const parentAttribute = displayFormsMap.get(
            dashboardAttributeFilterItemDisplayForm(parentFilter),
        )?.attribute;
        const dashboardFilterAttribute = displayFormsMap.get(dashboardFilterDisplayForm)?.attribute;

        if (!parentAttribute || !dashboardFilterAttribute) {
            return undefined;
        }

        return {
            parentOverAttributes: parent.over.attributes,
            displayFormsToGetAncestorsFor: [dashboardFilterAttribute, parentAttribute],
        };
    });

    if (parentValidationData.some((parent) => parent === undefined)) {
        return "INVALID_METADATA";
    }

    const supportsSettingConnectingAttributes =
        !!ctx.backend.capabilities.supportsSettingConnectingAttributes;

    if (supportsSettingConnectingAttributes) {
        const commonAttributeResults = await ctx.backend
            .workspace(ctx.workspace)
            .attributes()
            // the ! is fine here, we validated parentValidationData for empty items above
            .getCommonAttributesBatch(
                parentValidationData.map((item) => item!.displayFormsToGetAncestorsFor),
            );

        const validationPairs = zip(
            parentValidationData.map((item) => item!.parentOverAttributes),
            commonAttributeResults,
        ) as [ObjRef[], ObjRef[]][]; // we know the lengths match so we cast to get rid on the undefined in teh default typing

        // connection is valid if all the over attributes are part of the connecting attributes set
        const areAllConnectionsValid = validationPairs.every(
            ([parentOverAttributes, connectingAttrs]) =>
                differenceBy(parentOverAttributes, connectingAttrs, objRefToString).length === 0,
        );

        return areAllConnectionsValid ? "VALID" : "INVALID_CONNECTION";
    } else {
        // if the backend does not support setting connecting attributes, there is no need to validate the connections
        return "VALID";
    }
}
