// (C) 2020-2025 GoodData Corporation

import cloneDeepWith from "lodash/cloneDeepWith.js";

import { isIdentifierRef } from "@gooddata/sdk-model";

import { toObjQualifier } from "./ObjRefConverter.js";

export const cloneWithSanitizedIds = (item: any) =>
    cloneDeepWith(item, (value) => {
        if (isIdentifierRef(value)) {
            return toObjQualifier(value);
        }

        return undefined;
    });
