// (C) 2021-2025 GoodData Corporation
import { createEntityAdapter, EntityId } from "@reduxjs/toolkit";
import { IExecutionResultEnvelope } from "./types.js";

export const executionResultsAdapter = createEntityAdapter<IExecutionResultEnvelope, EntityId>({
    selectId: (execution) => execution.id,
});
