// (C) 2020 GoodData Corporation
import { IListedDashboard } from "@gooddata/sdk-backend-spi";

import {
    AnalyticalDashboardResourceSchema,
    AnalyticalDashboardResourcesResponseSchema,
} from "@gooddata/api-client-tiger";
import { idRef } from "@gooddata/sdk-model";

export const convertAnalyticalDashboard = (
    analyticalDashboard: AnalyticalDashboardResourceSchema,
): IListedDashboard => {
    const { id, attributes, links } = analyticalDashboard;
    const { title, description } = attributes;
    return {
        ref: idRef(id, "analyticalDashboard"),
        uri: (links as any).self,
        identifier: id,
        title: title ?? "",
        description: description ?? "",
        created: "",
        updated: "",
    };
};

export const convertAnalyticalDashboardToListItems = (
    analyticalDashboards: AnalyticalDashboardResourcesResponseSchema,
): IListedDashboard[] => {
    return analyticalDashboards.data.map(convertAnalyticalDashboard);
};
