// (C) 2021-2025 GoodData Corporation
import { createEntityAdapter, EntityId } from "@reduxjs/toolkit";
import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";

import { objRef } from "../../utils/objRef.js";
import { IDrillTargets } from "./drillTargetsTypes.js";

export const drillTargetsAdapter = createEntityAdapter<IDrillTargets, EntityId>({
    selectId: (drillTargets) => serializeObjRef(getIdFromDrillTargets(drillTargets)),
});

const getIdFromDrillTargets = (targets: IDrillTargets): ObjRef => {
    return objRef(targets.uri, targets.identifier);
};
