// (C) 2007-2020 GoodData Corporation

import { NotSupported } from "@gooddata/sdk-backend-spi";
import { isUriRef, ObjRef } from "@gooddata/sdk-model";
import { ExecuteAFM } from "../gd-tiger-model/ExecuteAFM";
import ObjQualifier = ExecuteAFM.ObjQualifier;

type ObjectTypes = "fact" | "label" | "dateDataSet";

function toObjQualifier(ref: ObjRef, type: ObjectTypes): ObjQualifier {
    if (isUriRef(ref)) {
        throw new NotSupported(`Tiger backend does not allow specifying ${type} by URI`);
    }

    return {
        identifier: {
            id: ref.identifier,
            type,
        },
    };
}

/**
 * @internal
 */
export function toFactQualifier(ref: ObjRef): ObjQualifier {
    return toObjQualifier(ref, "fact");
}

/**
 * @internal
 */
export function toDisplayFormQualifier(ref: ObjRef): ObjQualifier {
    return toObjQualifier(ref, "label");
}

/**
 * @internal
 */
export function toDateDataSetQualifier(ref: ObjRef): ObjQualifier {
    return toObjQualifier(ref, "dateDataSet");
}
