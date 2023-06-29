// (C) 2021-2022 GoodData Corporation
import differenceBy from "lodash/differenceBy.js";
import zip from "lodash/zip.js";
import {
    areObjRefsEqual,
    ObjRef,
    objRefToString,
    IDashboardAttributeFilter,
    IDashboardAttributeFilterParent,
    IAttributeDisplayFormMetadataObject,
} from "@gooddata/sdk-model";
import { DashboardContext } from "../../../../types/commonTypes.js";
import { ObjRefMap } from "../../../../../_staging/metadata/objRefMap.js";

export type AttributeFilterParentsValidationResult =
    | "VALID"
    | "EXTRANEOUS_PARENT"
    | "INVALID_CONNECTION"
    | "INVALID_METADATA";

export async function validateAttributeFilterParents(
    ctx: DashboardContext,
    dashboardFilter: IDashboardAttributeFilter,
    parents: IDashboardAttributeFilterParent[],
    allFilters: IDashboardAttributeFilter[],
    displayFormsMap: ObjRefMap<IAttributeDisplayFormMetadataObject>,
): Promise<AttributeFilterParentsValidationResult> {
    const allExceptValidated = allFilters.filter(
        (item) =>
            !areObjRefsEqual(item.attributeFilter.displayForm, dashboardFilter.attributeFilter.displayForm),
    );

    // first, validate that the parents only use the filters that are available
    const allExceptValidatedLocalIds = allExceptValidated.map((item) => item.attributeFilter.localIdentifier);
    const hasExtraneousParent = parents.some(
        (parent) => !allExceptValidatedLocalIds.includes(parent.filterLocalIdentifier),
    );
    if (hasExtraneousParent) {
        return "EXTRANEOUS_PARENT";
    }

    // then validate that the connecting attributes are valid
    const parentValidationData = parents.map((parent) => {
        const parentFilter = allExceptValidated.find(
            (item) => item.attributeFilter.localIdentifier === parent.filterLocalIdentifier,
        )!; // the ! is cool here, we validated that the parents are available in the code above

        const parentAttribute = displayFormsMap.get(parentFilter.attributeFilter.displayForm)?.attribute;
        const dashboardFilterAttribute = displayFormsMap.get(
            dashboardFilter.attributeFilter.displayForm,
        )?.attribute;

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

    const commonAttributeResults = await ctx.backend
        .workspace(ctx.workspace)
        .attributes()
        // the ! is fine here, we validated parentValidationData for empty items above
        .getCommonAttributesBatch(parentValidationData.map((item) => item!.displayFormsToGetAncestorsFor));

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
}
