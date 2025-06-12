// (C) 2021-2025 GoodData Corporation
import { createEntityAdapter } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { IExecutionResultEnvelope } from "./types.js";

export const executionResultsAdapter = createEntityAdapter<IExecutionResultEnvelope>({
    selectId: (execution) => execution.id,
});
