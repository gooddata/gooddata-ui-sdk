// (C) 2021 GoodData Corporation

import isEqualWith from "lodash/isEqualWith";
import { isImmutable } from "immutable";

/**
 * Determine if 'props' and 'nextProps' objects are equal
 *
 * @param props
 * @param nextProps
 * @returns true if yes, false if they are not equal
 *
 * @internal
 */
export function propsEqual<T>(props: T, nextProps: T): boolean {
    return isEqualWith(props, nextProps, (value, other) => {
        return isImmutable(value) ? value === other : undefined;
    });
}
