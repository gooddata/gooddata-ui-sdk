// (C) 2019-2020 GoodData Corporation

import { GdcMetadata } from "@gooddata/gd-bear-model";
import { uriRef } from "@gooddata/sdk-model";
import { IListedDashboard } from "@gooddata/sdk-backend-spi";

export const convertListedDashboard = (dashboardLink: GdcMetadata.IObjectLink): IListedDashboard => ({
    ref: uriRef(dashboardLink.link),
    identifier: dashboardLink.identifier!,
    uri: dashboardLink.link,
    title: dashboardLink.title!,
    description: dashboardLink.summary!,
    updated: dashboardLink.updated!,
    created: dashboardLink.created!,
});
