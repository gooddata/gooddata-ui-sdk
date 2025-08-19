// (C) 2021-2025 GoodData Corporation
import { IUser } from "@gooddata/sdk-model";

import { DashboardContext } from "../../../types/commonTypes.js";

export function loadUser(ctx: DashboardContext): Promise<IUser> {
    const { backend } = ctx;

    return backend.currentUser().getUserWithDetails();
}
