// (C) 2021-2026 GoodData Corporation

import { type IListedDashboard, uriRef } from "@gooddata/sdk-model";

export const lockedDashboards: IListedDashboard[] = [
    {
        ref: uriRef("/uri1"),
        uri: "/uri1",
        identifier: "id1",
        title: "1. Locked 1",
        description: "",
        shareStatus: "public",
        created: undefined,
        updated: undefined,
        isLocked: true,
        availability: "full",
    },
    {
        ref: uriRef("/uri2"),
        uri: "/uri2",
        identifier: "id2",
        title: "3. Locked 2",
        description: "",
        shareStatus: "shared",
        created: undefined,
        updated: undefined,
        isLocked: true,
        availability: "full",
    },
];

export const publicDashboards: IListedDashboard[] = [
    {
        ref: uriRef("/uri3"),
        uri: "/uri3",
        identifier: "id3",
        title: "2. Public 1",
        description: "",
        shareStatus: "public",
        created: undefined,
        updated: undefined,
        availability: "full",
    },
    {
        ref: uriRef("/uri4"),
        uri: "/uri4",
        identifier: "id4",
        title: "5. Public 2",
        description: "",
        shareStatus: "shared",
        created: undefined,
        updated: undefined,
        availability: "full",
    },
];

export const privateDashboards: IListedDashboard[] = [
    {
        ref: uriRef("/uri5"),
        uri: "/uri5",
        identifier: "id5",
        title: "4. Private 1",
        description: "",
        shareStatus: "private",
        created: undefined,
        updated: undefined,
        availability: "full",
    },
];
