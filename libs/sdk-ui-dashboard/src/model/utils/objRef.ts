// (C) 2021-2023 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";

export function objRef(uri: string, identifier: string): ObjRef {
    return { uri, identifier };
}
