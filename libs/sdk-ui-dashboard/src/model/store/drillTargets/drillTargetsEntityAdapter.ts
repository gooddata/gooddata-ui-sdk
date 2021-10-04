// (C) 2021 GoodData Corporation
import { createEntityAdapter } from "@reduxjs/toolkit";
import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { IDrillTargets } from "./drillTargetsTypes";

export const drillTargetsAdapter = createEntityAdapter<IDrillTargets>({
    selectId: (drillTargets) => serializeObjRef(getIdFromDrillTargets(drillTargets)),
});

const getIdFromDrillTargets = (targets: IDrillTargets): ObjRef => {
    return {
        uri: targets.uri,
        identifier: targets.identifier,
    };
};
