// (C) 2021 GoodData Corporation
import differenceBy from "lodash/differenceBy";
import { IDashboardAttributeFilter, IDashboardAttributeFilterParent } from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual, objRefToString } from "@gooddata/sdk-model";
import { DashboardContext } from "../../types/commonTypes";

export type AttributeFilterParentsValidationResult = "VALID" | "EXTRANEOUS_PARENT" | "INVALID_CONNECTION";

export async function validateAttributeFilterParents(
    ctx: DashboardContext,
    dashboardFilter: IDashboardAttributeFilter,
    parents: ReadonlyArray<IDashboardAttributeFilterParent>,
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
    const validationVector = await Promise.all(
        parents.map(async (parent) => {
            const parentFilter = allExceptValidated.find(
                (item) => item.attributeFilter.localIdentifier === parent.filterLocalIdentifier,
            )!; // the ! is cool here, we validated that the parents are available in the code above

            const connectingAttributeRefs = await ctx.backend
                .workspace(ctx.workspace)
                .attributes()
                .getCommonAttributes([
                    dashboardFilter.attributeFilter.displayForm,
                    parentFilter.attributeFilter.displayForm,
                ]);

            // connection is valid if all the over attributes are part of the connecting attributes set
            const isValidConnection =
                differenceBy(parent.over.attributes, connectingAttributeRefs, objRefToString).length === 0;

            return isValidConnection;
        }),
    );

    const areAllValid = validationVector.every(Boolean);
    return areAllValid ? "VALID" : "INVALID_CONNECTION";
}
