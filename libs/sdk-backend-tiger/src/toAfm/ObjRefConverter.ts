// (C) 2007-2020 GoodData Corporation

import { NotSupported } from "@gooddata/sdk-backend-spi";
import { isUriRef, ObjectType, ObjRef } from "@gooddata/sdk-model";
import { ExecuteAFM } from "../gd-tiger-model/ExecuteAFM";
import ObjQualifier = ExecuteAFM.ObjQualifier;
import ILocalIdentifierQualifier = ExecuteAFM.ILocalIdentifierQualifier;

type TigerObjectTypes = "metric" | "fact" | "attribute" | "label" | "dataSet";

// TODO: get rid of the defaultValue, tiger should explode if ref is not provided correctly
function toTigerObjectType(value: ObjectType | undefined, defaultValue: TigerObjectTypes): TigerObjectTypes {
    if (!value) {
        return defaultValue;
    }

    if (value === "measure") {
        return "metric";
    } else if (value === "displayForm") {
        return "label";
    }

    return value;
}

function toObjQualifier(ref: ObjRef, defaultValue: TigerObjectTypes): ObjQualifier {
    if (isUriRef(ref)) {
        throw new NotSupported(`Tiger backend does not allow referencing objects by URI.`);
    }

    return {
        identifier: {
            id: ref.identifier,
            type: toTigerObjectType(ref.type, defaultValue),
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
    return toObjQualifier(ref, "dataSet");
}

/**
 * @internal
 */
export function toLocalIdentifier(localIdentifier: string): ILocalIdentifierQualifier {
    return {
        localIdentifier,
    };
}
