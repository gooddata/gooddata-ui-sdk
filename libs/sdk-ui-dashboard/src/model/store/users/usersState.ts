// (C) 2024 GoodData Corporation

import { Users } from "../../types/commonTypes.js";

/**
 * @alpha
 */
export interface UsersState {
    users: Users;
}

export const usersInitialState: UsersState = { users: [] };
