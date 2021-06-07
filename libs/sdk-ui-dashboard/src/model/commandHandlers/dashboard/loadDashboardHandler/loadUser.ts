// (C) 2021 GoodData Corporation
import { IUser } from "@gooddata/sdk-backend-spi";
import { DashboardContext } from "../../../types/commonTypes";

export function loadUser(ctx: DashboardContext): Promise<IUser> {
    const { backend } = ctx;

    return backend.currentUser().getUser();
}
