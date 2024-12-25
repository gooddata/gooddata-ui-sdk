// (C) 2022-2024 GoodData Corporation
import { useEffect } from "react";
import { useDashboardDispatch, useDashboardSelector } from "./DashboardStoreProvider.js";
import { selectErrorUsers, selectUsersLoadingStatus, selectUsers } from "../store/users/usersSelectors.js";
import { loadAllWorkspaceUsers } from "../commands/users.js";

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
