// (C) 2020 GoodData Corporation
import {
    AnalyticalDashboard,
    AnalyticalDashboardAttributes,
    AnalyticalDashboardObject,
    AnalyticalDashboards,
    AnalyticalDashboardsItem,
} from "@gooddata/api-client-tiger";
import { IDashboard, IListedDashboard } from "@gooddata/sdk-backend-spi";

import { idRef } from "@gooddata/sdk-model";

import { cloneWithSanitizedIds } from "./IdSanitization";

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

export function convertAnalyticalDashboardContent(
    analyticalDashboard: AnalyticalDashboardObject.IAnalyticalDashboard["analyticalDashboard"],
): AnalyticalDashboardObject.IAnalyticalDashboard["analyticalDashboard"] {
    return {
        isLocked: analyticalDashboard.isLocked,
        dateFilterConfig: cloneWithSanitizedIds(analyticalDashboard.dateFilterConfig),
        filterContext: cloneWithSanitizedIds(analyticalDashboard.filterContext),
        layout: cloneWithSanitizedIds(analyticalDashboard.layout),
    };
}

export function convertDashboard(analyticalDashboard: AnalyticalDashboard): IDashboard {
    const { id, attributes = {} } = analyticalDashboard.data;
    const { title = "", description = "", content } = attributes;

    const dashboardData = convertAnalyticalDashboardContent(
        (content as AnalyticalDashboardObject.IAnalyticalDashboard).analyticalDashboard,
    );

    return {
        ref: idRef(id, "analyticalDashboard"),
        identifier: id,
        uri: (analyticalDashboard.links as any).self,
        title,
        description,
        created: "",
        updated: "",
        ...dashboardData,
    };
}
