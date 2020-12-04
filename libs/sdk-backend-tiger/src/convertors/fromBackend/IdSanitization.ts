// (C) 2020 GoodData Corporation
import { isObjectIdentifier } from "@gooddata/api-client-tiger";
import cloneDeepWith from "lodash/cloneDeepWith";
import { toObjRef } from "./afm/ObjRefConverter";

export const cloneWithSanitizedIds = (item: any) =>
    cloneDeepWith(item, (value) => {
        if (isObjectIdentifier(value)) {
            return toObjRef(value);
        }

        return undefined;
    });
