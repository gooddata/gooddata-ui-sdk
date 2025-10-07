// (C) 2021-2025 GoodData Corporation
import { IUser } from "@gooddata/sdk-model";

import { DashboardContext } from "../../../types/commonTypes.js";

export function loadUser({ backend }: DashboardContext): Promise<IUser> {
    return backend.currentUser().getUserWithDetails();
}
