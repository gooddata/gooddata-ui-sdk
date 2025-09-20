// (C) 2020-2025 GoodData Corporation
import { cloneDeepWith } from "lodash-es";

import { isAfmObjectIdentifier } from "@gooddata/api-client-tiger";

import { toObjRef } from "./ObjRefConverter.js";

export const cloneWithSanitizedIds = (item: any) =>
    cloneDeepWith(item, (value) => {
        if (isAfmObjectIdentifier(value)) {
            return toObjRef(value);
        }

        return undefined;
    });
