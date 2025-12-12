// (C) 2021-2025 GoodData Corporation
import { type IUser } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../types/commonTypes.js";

export function loadUser({ backend }: DashboardContext): Promise<IUser> {
    return backend.currentUser().getUserWithDetails();
}
