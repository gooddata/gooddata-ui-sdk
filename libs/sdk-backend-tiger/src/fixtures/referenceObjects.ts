// (C) 2022 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";

export const stageStatuses = [
    { title: "Lost", uri: "/api/elements/referenceworkspace/obj/1100/elements?id=460496" },
    { title: "Open", uri: "/api/elements/referenceworkspace/obj/1100/elements?id=460494" },
    { title: "Won", uri: "/api/elements/referenceworkspace/obj/1100/elements?id=460495" },
];

export const productName = [
    { title: "CompuSci", uri: "/gdc/md/referenceworkspace/obj/1054/elements?id=165678" },
    { title: "Educationly", uri: "/gdc/md/referenceworkspace/obj/1054/elements?id=165847" },
    { title: "Explorer", uri: "/gdc/md/referenceworkspace/obj/1054/elements?id=342345" },
    { title: "Grammar Plus", uri: "/gdc/md/referenceworkspace/obj/1054/elements?id=168737" },
    { title: "PhoenixSoft", uri: "/gdc/md/referenceworkspace/obj/1054/elements?id=166339" },
    { title: "TouchAll", uri: "/gdc/md/referenceworkspace/obj/1054/elements?id=460491" },
    { title: "WonderKid", uri: "/gdc/md/referenceworkspace/obj/1054/elements?id=166497" },
];

/**
 * A reference to Stage History Attribute
 */
export const StageHistoryAttributeRef: ObjRef = {
    identifier: "attr.stagehistory.id",
};
