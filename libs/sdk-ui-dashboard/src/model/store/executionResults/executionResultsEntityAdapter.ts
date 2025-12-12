// (C) 2021-2025 GoodData Corporation
import { type EntityId, createEntityAdapter } from "@reduxjs/toolkit";

import { type IExecutionResultEnvelope } from "./types.js";

export const executionResultsAdapter = createEntityAdapter<IExecutionResultEnvelope, EntityId>({
    selectId: (execution) => execution.id,
});
