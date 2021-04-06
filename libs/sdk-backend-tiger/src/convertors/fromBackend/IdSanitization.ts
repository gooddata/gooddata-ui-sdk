// (C) 2020-2021 GoodData Corporation
import { isAfmObjectIdentifier } from "@gooddata/api-client-tiger";
import cloneDeepWith from "lodash/cloneDeepWith";
import { toObjRef } from "./ObjRefConverter";

export const cloneWithSanitizedIds = (item: any) =>
    cloneDeepWith(item, (value) => {
        if (isAfmObjectIdentifier(value)) {
            return toObjRef(value);
        }

        return undefined;
    });
