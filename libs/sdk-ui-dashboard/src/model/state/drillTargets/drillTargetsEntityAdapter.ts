// (C) 2021 GoodData Corporation
import { createEntityAdapter } from "@reduxjs/toolkit";
import { serializeObjRef } from "@gooddata/sdk-model";
import { IDrillTargets } from "./drillTargetsTypes";

export const drillTargetsAdapter = createEntityAdapter<IDrillTargets>({
    selectId: (drillTargets) => serializeObjRef(drillTargets.ref),
});
