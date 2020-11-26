// (C) 2020 GoodData Corporation
import { IListedDashboard } from "@gooddata/sdk-backend-spi";

import {
    AnalyticalDashboardAttributes,
    AnalyticalDashboards,
    AnalyticalDashboardsItem,
} from "@gooddata/api-client-tiger";

import { idRef } from "@gooddata/sdk-model";

export const convertAnalyticalDashboard = (
    analyticalDashboard: AnalyticalDashboardsItem,
): IListedDashboard => {
    const attributes = analyticalDashboard.attributes as AnalyticalDashboardAttributes;
    const { title, description } = attributes;
    return {
        ref: idRef(analyticalDashboard.id, "analyticalDashboard"),
        uri: analyticalDashboard.links!.self,
        identifier: analyticalDashboard.id,
        title: title ?? "",
        description: description ?? "",
        created: "",
        updated: "",
    };
};

export const convertAnalyticalDashboardToListItems = (
    analyticalDashboards: AnalyticalDashboards,
): IListedDashboard[] => {
    return analyticalDashboards.data.map(convertAnalyticalDashboard);
};
