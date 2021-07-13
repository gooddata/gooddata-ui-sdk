// (C) 2021 GoodData Corporation
// "Original" here: https://github.com/moroshko/shallow-equal/blob/master/src/objects.js

/**
 * @internal
 */
export function shallowEqualObjects(objA: Record<string, any>, objB: Record<string, any>): boolean {
    if (objA === objB) {
        return true;
    }

    if (!objA || !objB) {
        return false;
    }

    const aKeys = Object.keys(objA);
    const bKeys = Object.keys(objB);
    const len = aKeys.length;

    if (bKeys.length !== len) {
        return false;
    }

    for (let i = 0; i < len; i++) {
        const key = aKeys[i];

        if (objA[key] !== objB[key] || !Object.prototype.hasOwnProperty.call(objB, key)) {
            return false;
        }
    }

    return true;
}
