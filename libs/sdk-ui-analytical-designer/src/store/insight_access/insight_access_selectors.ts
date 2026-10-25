// (C) 2026 GoodData Corporation

import { type IAppState } from "../types.js";

export const getInsightAccessDraft = (state: IAppState) => state.data.insightAccessDraft ?? undefined;
