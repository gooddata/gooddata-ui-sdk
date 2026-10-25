// (C) 2026 GoodData Corporation

import { type IAppState } from "../types.js";

import { type IPostponedActionState } from "./postponed_action_state.js";

export const getPostponedAction = (state: IAppState): IPostponedActionState | undefined =>
    state.data.postponedAction ?? undefined;
