// (C) 2022-2025 GoodData Corporation
import { useEffect } from "react";

import { useDashboardDispatch, useDashboardSelector } from "./DashboardStoreProvider.js";
import { loadAllWorkspaceUsers } from "../commands/users.js";
import { selectErrorUsers, selectUsers, selectUsersLoadingStatus } from "../store/users/usersSelectors.js";

/**
 * @internal
 */
export const useWorkspaceUsers = () => {
    const dispatch = useDashboardDispatch();
    const usersError = useDashboardSelector(selectErrorUsers);
    const users = useDashboardSelector(selectUsers);
    const status = useDashboardSelector(selectUsersLoadingStatus);

    useEffect(() => {
        /**
         * Load users only if they are not loaded yet
         */
        if (status === "pending") {
            dispatch(loadAllWorkspaceUsers());
        }
    }, [status, dispatch]);

    return {
        status,
        usersError,
        users,
    };
};
