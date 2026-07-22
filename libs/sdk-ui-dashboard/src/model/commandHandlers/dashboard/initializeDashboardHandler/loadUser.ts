// (C) 2021-2026 GoodData Corporation

import { type IUser } from "@gooddata/sdk-model";

import { type InitializeDashboard } from "../../../commands/dashboard.js";
import { type DashboardContext } from "../../../types/commonTypes.js";

export function loadUser({ backend }: DashboardContext, cmd: InitializeDashboard): Promise<IUser> {
    // Reuse a user supplied via config instead of re-fetching it, so an embedding application that
    // already resolved the current user does not trigger a duplicate backend request.
    const preloadedUser = cmd.payload.config?.user;
    if (preloadedUser) {
        return Promise.resolve(preloadedUser);
    }
    return backend.currentUser().getUserWithDetails();
}
