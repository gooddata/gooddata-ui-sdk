// (C) 2021-2022 GoodData Corporation
import { IUser } from "@gooddata/sdk-model";
import { DashboardContext } from "../../../types/commonTypes.js";

export function loadUser(ctx: DashboardContext): Promise<IUser> {
    const { backend } = ctx;

    return backend.currentUser().getUser();
}
