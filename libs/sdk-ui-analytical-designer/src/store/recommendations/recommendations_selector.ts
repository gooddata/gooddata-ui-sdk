// (C) 2026 GoodData Corporation

import { type IAppState } from "../types.js";

export const getDismissedRecommendations = (state: IAppState) => state.appState.dismissedRecommendations;
