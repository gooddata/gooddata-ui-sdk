// (C) 2024-2025 GoodData Corporation

import { invariant } from "ts-invariant";

import {
    AnalyticalDashboardModelV2,
    type JsonApiFilterViewOutIncludes,
    type JsonApiFilterViewOutWithLinks,
} from "@gooddata/api-client-tiger";
import { type IDashboardFilterView, idRef } from "@gooddata/sdk-model";

import { convertFilterViewContextFilters } from "./analyticalDashboards/v2/AnalyticalDashboardConverter.js";

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
    const { title, isDefault, content } = attributes;

    invariant(relationships?.analyticalDashboard, "Analytical dashboard is missing from response.");
    invariant(relationships?.analyticalDashboard.data, "Analytical dashboard is missing from response.");
    invariant(relationships?.user, "User is missing from response.");
    invariant(relationships?.user.data, "User is missing from response.");
    invariant(included);
    invariant(
        AnalyticalDashboardModelV2.isFilterContextWithTab(content),
        "Entity content is not of FilterContextType",
    );

    return {
        ref: idRef(id, type),
        dashboard: idRef(
            relationships?.analyticalDashboard.data.id,
            relationships?.analyticalDashboard.data.type,
        ),
        user: idRef(relationships?.user.data.id, relationships?.user.data.type),
        name: title,
        filterContext: {
            title: "",
            description: "",
            filters: convertFilterViewContextFilters(content),
        },
        isDefault: isDefault ?? false,
        tabLocalIdentifier: content.tabLocalIdentifier,
    };
}
