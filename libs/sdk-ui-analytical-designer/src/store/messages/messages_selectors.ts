// (C) 2026 GoodData Corporation

import { type IAppState } from "../types.js";
// (C) 2026 GoodData Corporation

/** The domain's single input selector. */
export const getMessagesState = (state: IAppState) => state.appState.messages;
