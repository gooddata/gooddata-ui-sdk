// (C) 2026 GoodData Corporation

import { type IObjectShareDraft } from "@gooddata/sdk-ui-ext";

/** `data.insightAccessDraft` — the sharing drafted for a visualization that is not saved yet. */
export type IInsightAccessState = IObjectShareDraft | null;

export const insightAccessInitialState: IInsightAccessState = null;
