// (C) 2021-2022 GoodData Corporation
import differenceBy from "lodash/differenceBy";
import zip from "lodash/zip";
import {
    areObjRefsEqual,
    ObjRef,
    objRefToString,
    IDashboardAttributeFilter,
    IDashboardAttributeFilterParent,
} from "@gooddata/sdk-model";
import { DashboardContext } from "../../../../types/commonTypes";

export type AttributeFilterParentsValidationResult = "VALID" | "EXTRANEOUS_PARENT" | "INVALID_CONNECTION";

export async function validateAttributeFilterParents(
    ctx: DashboardContext,
    dashboardFilter: IDashboardAttributeFilter,
    parents: IDashboardAttributeFilterParent[],
    allFilters: IDashboardAttributeFilter[],
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

        return {
            parentOverAttributes: parent.over.attributes,
            displayFormsToGetAncestorsFor: [
                dashboardFilter.attributeFilter.displayForm,
                parentFilter.attributeFilter.displayForm,
            ],
        };
    });

    const commonAttributeResults = await ctx.backend
        .workspace(ctx.workspace)
        .attributes()
        .getCommonAttributesBatch(parentValidationData.map((item) => item.displayFormsToGetAncestorsFor));

    const validationPairs = zip(
        parentValidationData.map((item) => item.parentOverAttributes),
        commonAttributeResults,
    ) as [ObjRef[], ObjRef[]][]; // we know the lengths match so we cast to get rid on the undefined in teh default typing

    // connection is valid if all the over attributes are part of the connecting attributes set
    const areAllConnectionsValid = validationPairs.every(
        ([parentOverAttributes, connectingAttrs]) =>
            differenceBy(parentOverAttributes, connectingAttrs, objRefToString).length === 0,
    );

    return areAllConnectionsValid ? "VALID" : "INVALID_CONNECTION";
}
