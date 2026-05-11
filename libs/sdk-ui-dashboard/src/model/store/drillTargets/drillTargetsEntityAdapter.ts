// (C) 2021-2026 GoodData Corporation

import { type EntityId, createEntityAdapter } from "@reduxjs/toolkit";

import { type ObjRef, serializeObjRef } from "@gooddata/sdk-model";

import { objRef } from "../../utils/objRef.js";

import { type IDrillTargets } from "./drillTargetsTypes.js";

export const drillTargetsAdapter = createEntityAdapter<IDrillTargets, EntityId>({
    selectId: (drillTargets) => serializeObjRef(getIdFromDrillTargets(drillTargets)),
});

const getIdFromDrillTargets = (targets: IDrillTargets): ObjRef => {
    return objRef(targets.uri, targets.identifier);
};
