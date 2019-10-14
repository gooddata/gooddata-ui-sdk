// (C) 2007-2019 GoodData Corporation
import { has } from "lodash";

export function createUniqueTitle(obj: any, itemName: string, orig: string = "", num: number = 1): string {
    const name = orig || itemName;
    if (has(obj, itemName)) {
        return createUniqueTitle(obj, `${name}(${num})`, name, num + 1);
    }

    return itemName;
}
