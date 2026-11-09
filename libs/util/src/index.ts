// (C) 2019-2026 GoodData Corporation

// oxlint-disable no-barrel-files/no-barrel-files

/**
 * This package contains utility functions used in production or test code of multiple different GoodData.UI packages.
 *
 * @remarks
 * The functions exported from here are not part of the GoodData.UI public API.
 *
 * @packageDocumentation
 */

export { shiftArrayRight } from "./arrayUtils.js";
export { shallowEqualObjects } from "./objectUtils.js";
export {
    type IShortenTextOptions,
    hashCodeString,
    randomString,
    shortenText,
    escapeRegExp,
    simplifyText,
    parseStringToArray,
} from "./stringUtils.js";
export { removeMetadata, sanitizeLocaleForMoment } from "./translationUtils.js";
export { type GuardType, type EmptyObject, combineGuards } from "./typesUtils.js";
export {
    type MatcherFunction,
    type ConsoleFunction,
    type Matcher,
    type SpecificMatcherFunction,
    type ConsoleType,
    type WaitForFn,
    delay,
    strictBarrel,
    suppressConsole,
    createTightWaitFor,
} from "./testUtils.js";

// local functions from lodash-es
export { _camelCase } from "./_/camelCase.js";
export { _cloneDeep } from "./_/cloneDeep.js";
export { type _Falsey, _compact } from "./_/compact.js";
export {
    type _DebouncedFunc,
    type _DebouncedFuncLeading,
    type _DebounceSettings,
    type _DebounceSettingsLeading,
    _debounce,
} from "./_/debounce.js";
export { _groupBy } from "./_/groupBy.js";
export { _isEqual } from "./_/isEqual.js";
export { type _EmptyObject, type _EmptyObjectOf, _isEmpty } from "./_/isEmpty.js";
export {
    type _MapCache,
    type _MapCacheConstructor,
    type _Memoize,
    type _MemoizedFunction,
    _memoize,
} from "./_/memoize.js";
export { _merge } from "./_/merge.js";
export { _omit } from "./_/omit.js";
export { _omitBy } from "./_/omitBy.js";
export { _partition } from "./_/partition.js";
export { _pick } from "./_/pick.js";
export { _range } from "./_/range.js";
export { type _PropertyPath, _set } from "./_/set.js";
export { _sortBy } from "./_/sortBy.js";
export { type _ThrottleSettings, type _ThrottleSettingsLeading, _throttle } from "./_/throttle.js";
export { _uniq } from "./_/uniq.js";
export { _uniqBy } from "./_/uniqBy.js";
export type {
    _Dictionary,
    _IterateeShorthand,
    _List,
    _ListIteratee,
    _ListIterator,
    _Many,
    _NotVoid,
    _NumericDictionary,
    _ObjectIteratee,
    _ObjectIterator,
    _PartialObject,
    _PartialShallow,
    _PropertyName,
    _ValueIteratee,
    _ValueIteratorTypeGuard,
    _ValueKeyIteratee,
} from "./_/types.js";
