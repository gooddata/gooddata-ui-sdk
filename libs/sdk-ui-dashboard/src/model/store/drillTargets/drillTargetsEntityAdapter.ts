// (C) 2021-2025 GoodData Corporation
import { createEntityAdapter } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";

import { objRef } from "../../utils/objRef.js";
import { IDrillTargets } from "./drillTargetsTypes.js";

export const drillTargetsAdapter = createEntityAdapter<IDrillTargets>({
    selectId: (drillTargets) => serializeObjRef(getIdFromDrillTargets(drillTargets)),
});

const getIdFromDrillTargets = (targets: IDrillTargets): ObjRef => {
    return objRef(targets.uri, targets.identifier);
};
