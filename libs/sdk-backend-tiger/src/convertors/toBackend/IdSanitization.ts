// (C) 2020 GoodData Corporation

import { isIdentifierRef } from "@gooddata/sdk-model";
import cloneDeepWith from "lodash/cloneDeepWith";
import { toObjQualifier } from "./ObjRefConverter";

export const cloneWithSanitizedIds = (item: any) =>
    cloneDeepWith(item, (value) => {
        if (isIdentifierRef(value)) {
            return toObjQualifier(value);
        }

        return undefined;
    });
