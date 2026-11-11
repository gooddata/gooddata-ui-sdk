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
export { _assignIn } from "./_/assignIn.js";
export { _bindAll } from "./_/bindAll.js";
export { _camelCase } from "./_/camelCase.js";
export { _capitalize } from "./_/capitalize.js";
export { _chunk } from "./_/chunk.js";
export { _clamp } from "./_/clamp.js";
export { _clone } from "./_/clone.js";
export { _cloneDeep } from "./_/cloneDeep.js";
export { _cloneDeepWith } from "./_/cloneDeepWith.js";
export { type _Falsey, _compact } from "./_/compact.js";
export { _constant } from "./_/constant.js";
export {
    type _DebouncedFunc,
    type _DebouncedFuncLeading,
    type _DebounceSettings,
    type _DebounceSettingsLeading,
    _debounce,
} from "./_/debounce.js";
export { _deburr } from "./_/deburr.js";
export { _defaults } from "./_/defaults.js";
export { _difference } from "./_/difference.js";
export { _differenceBy } from "./_/differenceBy.js";
export { _differenceWith } from "./_/differenceWith.js";
export { _dropRightWhile } from "./_/dropRightWhile.js";
export { _escape } from "./_/escape.js";
export { _escapeRegExp } from "./_/escapeRegExp.js";
export { _findKey } from "./_/findKey.js";
export { _findLastIndex } from "./_/findLastIndex.js";
export { _get } from "./_/get.js";
export { _groupBy } from "./_/groupBy.js";
export { _has } from "./_/has.js";
export { _inRange } from "./_/inRange.js";
export { _initial } from "./_/initial.js";
export { _intersection } from "./_/intersection.js";
export { _intersectionBy } from "./_/intersectionBy.js";
export { _intersectionWith } from "./_/intersectionWith.js";
export { _invert } from "./_/invert.js";
export { type _EmptyObject, type _EmptyObjectOf, _isEmpty } from "./_/isEmpty.js";
export { _isEqual } from "./_/isEqual.js";
export { _isError } from "./_/isError.js";
export { _isPlainObject } from "./_/isPlainObject.js";
export { _kebabCase } from "./_/kebabCase.js";
export { _keyBy } from "./_/keyBy.js";
export { _mapValues } from "./_/mapValues.js";
export { _max } from "./_/max.js";
export {
    type _MapCache,
    type _MapCacheConstructor,
    type _Memoize,
    type _MemoizedFunction,
    _memoize,
} from "./_/memoize.js";
export { _merge } from "./_/merge.js";
export { _mergeWith } from "./_/mergeWith.js";
export { _min } from "./_/min.js";
export { _negate } from "./_/negate.js";
export { _omit } from "./_/omit.js";
export { _omitBy } from "./_/omitBy.js";
export { type _Partial, type _Placeholder, _partial } from "./_/partial.js";
export { _partition } from "./_/partition.js";
export { _pick } from "./_/pick.js";
export { _pickBy } from "./_/pickBy.js";
export { _range } from "./_/range.js";
export { _reduce } from "./_/reduce.js";
export { type _PropertyPath, _set } from "./_/set.js";
export { _sortBy } from "./_/sortBy.js";
export { _sumBy } from "./_/sumBy.js";
export { _tail } from "./_/tail.js";
export { type _ThrottleSettings, type _ThrottleSettingsLeading, _throttle } from "./_/throttle.js";
export { _times } from "./_/times.js";
export { _unescape } from "./_/unescape.js";
export { _union } from "./_/union.js";
export { _unionBy } from "./_/unionBy.js";
export { _uniq } from "./_/uniq.js";
export { _uniqBy } from "./_/uniqBy.js";
export { _uniqWith } from "./_/uniqWith.js";
export { _update } from "./_/update.js";
export { _updateWith } from "./_/updateWith.js";
export { _without } from "./_/without.js";
export { _zip } from "./_/zip.js";
export type {
    _ArrayIterator,
    _CloneDeepWithCustomizer,
    _Comparator,
    _Comparator2,
    _Dictionary,
    _Function0,
    _Function1,
    _Function2,
    _Function3,
    _Function4,
    _IterateeShorthand,
    _List,
    _ListIteratee,
    _ListIterateeCustom,
    _ListIterator,
    _Many,
    _MemoListIterator,
    _MemoObjectIterator,
    _MergeWithCustomizer,
    _NotVoid,
    _NumericDictionary,
    _ObjectIteratee,
    _ObjectIterator,
    _PartialObject,
    _PartialShallow,
    _PropertyName,
    _SetWithCustomizer,
    _StringIterator,
    _ValueIteratee,
    _ValueIterateeCustom,
    _ValueIteratorTypeGuard,
    _ValueKeyIteratee,
} from "./_/types.js";
