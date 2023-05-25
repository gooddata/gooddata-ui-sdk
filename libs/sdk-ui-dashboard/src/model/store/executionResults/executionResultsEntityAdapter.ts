// (C) 2021 GoodData Corporation
import { createEntityAdapter } from "@reduxjs/toolkit";
import { IExecutionResultEnvelope } from "./types.js";

export const executionResultsAdapter = createEntityAdapter<IExecutionResultEnvelope>({
    selectId: (execution) => execution.id,
});
