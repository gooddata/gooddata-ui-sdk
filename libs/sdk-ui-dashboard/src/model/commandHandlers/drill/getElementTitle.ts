// (C) 2020-2025 GoodData Corporation
import { IElementsQueryOptions } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";

import { DashboardContext } from "../../types/commonTypes.js";

export async function getElementTitle(
    projectId: string,
    dfRef: ObjRef,
    attrElementUriOrPrimaryLabel: string,
    ctx: DashboardContext,
): Promise<string | null> {
    const queryOptions: IElementsQueryOptions = {
        elements: ctx.backend.capabilities.supportsElementUris
            ? {
                  uris: [attrElementUriOrPrimaryLabel],
              }
            : {
                  primaryValues: [attrElementUriOrPrimaryLabel],
              },
    };

    const validElementsQuery = await ctx.backend
        .workspace(projectId)
        .attributes()
        .elements()
        .forDisplayForm(dfRef)
        .withLimit(1)
        .withOptions(queryOptions)
        .query();

    return validElementsQuery.items[0].title;
}

/**
 * For set of primary label elements and secondary label ref resolves element titles in this label
 * @param projectId - model's project id to resolve elements in
 * @param secondaryLabelRef - reference to label to resolve elements for
 * @param attrPrimaryLabelValues - element values in primary label of the attribute
 * @param ctx - dashboard context
 * @returns Element values in secondary label for provided primary label values
 */
export async function getElementsSecondaryTitles(
    projectId: string,
    secondaryLabelRef: ObjRef,
    attrPrimaryLabelValues: (string | null)[],
    ctx: DashboardContext,
): Promise<Array<string | null>> {
    const queryOptions: IElementsQueryOptions = {
        elements: {
            primaryValues: attrPrimaryLabelValues,
        },
    };

    const validElementsQuery = await ctx.backend
        .workspace(projectId)
        .attributes()
        .elements()
        .forDisplayForm(secondaryLabelRef)
        .withLimit(attrPrimaryLabelValues.length)
        .withOptions(queryOptions)
        .query();

    return validElementsQuery.items.map((i) => i.title);
}
