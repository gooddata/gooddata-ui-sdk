// (C) 2021 GoodData Corporation
import memoize from "lodash/memoize.js";
import stringify from "json-stable-stringify";

/**
 * Memoizes selector factory by its arguments.
 * This avoids recreating & recomputing selector on each render (and thus changing reference of the result), if the factory arguments are the same.
 * Use it wisely (don't use it for selector factories that changes arguments very often, or selector factories that are used in a large component lists/trees).
 *
 * Another option is to use this approach: https://react-redux.js.org/api/hooks#using-memoizing-selectors but it's ugly.
 *
 * @param selector - selector factory
 * @returns selector factory that will be memoized by its stringified arguments
 */
export const createMemoizedSelector = <TSelectorFactory extends (...args: any[]) => any>(
    selector: TSelectorFactory,
): TSelectorFactory => memoize(selector, (...args) => stringify(args, { space: 0 }));
