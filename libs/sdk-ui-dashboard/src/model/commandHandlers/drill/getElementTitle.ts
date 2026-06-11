// (C) 2020-2026 GoodData Corporation

import { type IElementsQueryOptions } from "@gooddata/sdk-backend-spi";
import { type ObjRef, objRefToString } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../types/commonTypes.js";

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

    const element = validElementsQuery.items[0];
    if (!element) {
        // The drilled value has no matching element on this display form (the elements query returned
        // nothing). Fail with a descriptive message instead of a raw "items[0] is undefined" TypeError,
        // so the resulting "Failed to load URL" is diagnosable from the console.
        const message = `Drill to custom URL: no attribute element found for display form ${objRefToString(
            dfRef,
        )} and value "${attrElementUriOrPrimaryLabel}"; the attribute_title placeholder cannot be resolved.`;
        console.warn(message);
        throw new Error(message);
    }

    return element.title;
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
