// (C) 2024 GoodData Corporation

import { IDashboardFilterView, idRef } from "@gooddata/sdk-model";
import {
    JsonApiFilterContextOutWithLinks,
    JsonApiFilterContextOutWithLinksTypeEnum,
    JsonApiFilterViewOutWithLinks,
    JsonApiFilterViewOutIncludes,
} from "@gooddata/api-client-tiger";
import { invariant } from "ts-invariant";
import { convertFilterContextWithLinksFromBackend } from "./analyticalDashboards/AnalyticalDashboardConverter.js";

/**
 * Convert filter view from API response.
 * The method expects that API call was made with "include=[user,analyticalDashboard,filterContext]
 * @param data - API response data
 * @param included - array with included information
 */
export function convertFilterView(
    data: JsonApiFilterViewOutWithLinks,
    included: JsonApiFilterViewOutIncludes[] = [],
): IDashboardFilterView {
    const { id, type, attributes, relationships } = data;
    const { title, isDefault } = attributes;

    invariant(relationships?.analyticalDashboard, "Analytical dashboard is missing from response.");
    invariant(relationships?.analyticalDashboard.data, "Analytical dashboard is missing from response.");
    invariant(relationships?.user, "User is missing from response.");
    invariant(relationships?.user.data, "User is missing from response.");
    invariant(included);

    const rawFilterContext = included.find((include): include is JsonApiFilterContextOutWithLinks => {
        return (
            include.type === JsonApiFilterContextOutWithLinksTypeEnum.FILTER_CONTEXT &&
            include.id === relationships?.filterContext?.data?.id
        );
    });

    invariant(rawFilterContext, "Filter context is missing from response.");

    const filterContext = convertFilterContextWithLinksFromBackend(rawFilterContext);

    return {
        ref: idRef(id, type),
        dashboard: idRef(
            relationships?.analyticalDashboard.data.id,
            relationships?.analyticalDashboard.data.type,
        ),
        user: idRef(relationships?.user.data.id, relationships?.user.data.type),
        name: title,
        filterContext,
        isDefault: isDefault ?? false,
    };
}
