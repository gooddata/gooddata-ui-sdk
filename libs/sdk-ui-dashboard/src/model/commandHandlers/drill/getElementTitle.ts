// (C) 2020-2021 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { DashboardContext } from "../../types/commonTypes";

export async function getElementTitle(
    projectId: string,
    dfRef: ObjRef,
    attrElementUriOrPrimaryLabel: string,
    ctx: DashboardContext,
): Promise<string> {
    if (!ctx.backend.capabilities.supportsElementUris) {
        /*
         * TODO: for now return the "uri" directly on backends without element URI support (as it is the primary
         * label value there), we need to implement the withOptions.uris there in some way later
         */
        return Promise.resolve(attrElementUriOrPrimaryLabel);
    }

    const validElementsQuery = await ctx.backend
        .workspace(projectId)
        .attributes()
        .elements()
        .forDisplayForm(dfRef)
        .withLimit(1)
        .withOptions({
            uris: [attrElementUriOrPrimaryLabel],
        })
        .query();

    return validElementsQuery.items[0].title;
}
