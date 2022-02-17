// (C) 2020-2022 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { DashboardContext } from "../../types/commonTypes";

export async function getElementTitle(
    projectId: string,
    dfRef: ObjRef,
    attrElementUriOrPrimaryLabel: string,
    ctx: DashboardContext,
): Promise<string> {
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
