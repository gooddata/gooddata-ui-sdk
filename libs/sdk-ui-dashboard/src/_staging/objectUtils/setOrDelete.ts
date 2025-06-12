// (C) 2022 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";

export function setOrDelete<T extends object, K extends keyof T>(object: T, prop: K, value: T[K]) {
    if (isEmpty(value)) {
        delete object[prop];
    } else {
        object[prop] = value;
    }
}
