// (C) 2021-2022 GoodData Corporation

import { IDashboard, IListedDashboard } from "@gooddata/sdk-model";

/**
 * This function convert IDashboard into IListedDashboard
 * @internal
 */
export const createListedDashboard = (dashboard: IDashboard): IListedDashboard => {
    const { created, description, identifier, ref, title, updated, uri, tags, shareStatus, isLocked } =
        dashboard;

    return {
        created,
        description,
        identifier,
        ref,
        title,
        updated,
        uri,
        tags,
        shareStatus,
        isLocked,
        availability: "full",
    };
};
