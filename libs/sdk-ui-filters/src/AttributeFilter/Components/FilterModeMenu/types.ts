// (C) 2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

import { type AttributeFilterMode } from "../../filterModeTypes.js";

export type IModeItemData = {
    mode: AttributeFilterMode;
};

export type ILabelItemData = {
    labelRef: ObjRef;
};
