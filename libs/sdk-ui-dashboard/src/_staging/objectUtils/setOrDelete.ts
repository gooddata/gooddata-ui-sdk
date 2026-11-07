// (C) 2022-2026 GoodData Corporation

import { _isEmpty } from "@gooddata/util";

export function setOrDelete<T extends object, K extends keyof T>(object: T, prop: K, value: T[K]) {
    if (_isEmpty(value)) {
        delete object[prop];
    } else {
        object[prop] = value;
    }
}
