// (C) 2026 GoodData Corporation

import { type IAppState } from "../types.js";
// (C) 2026 GoodData Corporation

/**
 * The domain's single input selector. The derived locale/messages selectors stay in
 * selectors/intl_selector.ts and hang off it.
 */
export const getIntlState = (state: IAppState) => state.appState.intl;
