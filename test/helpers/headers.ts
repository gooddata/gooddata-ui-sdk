// (C) 2007-2018 GoodData Corporation
import { isPlainObject } from "lodash";
import { MockRequest } from "fetch-mock";

/**
 * Tests whether the passed object is a hash map
 *
 * @param obj given object
 */
function isHashMap(obj: any): obj is { [t: string]: string } {
    return isPlainObject(obj);
}

export function getHeaderValue(request: MockRequest, name: string): string {
    if (isHashMap(request.headers)) {
        return request.headers[name];
    }

    throw new Error(`Could not get header ${name}`);
}
