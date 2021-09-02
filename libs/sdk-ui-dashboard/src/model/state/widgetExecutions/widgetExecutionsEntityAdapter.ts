// (C) 2021 GoodData Corporation
import { createEntityAdapter } from "@reduxjs/toolkit";
import { serializeObjRef } from "@gooddata/sdk-model";
import { IWidgetExecution } from "./types";

export const widgetExecutionsAdapter = createEntityAdapter<IWidgetExecution>({
    selectId: (execution) => serializeObjRef(execution.widgetRef),
});
