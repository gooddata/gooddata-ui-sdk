// (C) 2026 GoodData Corporation

/*!
 * Portions of this file are derived from Lodash.
 * https://github.com/lodash/lodash
 *
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 *
 * Based on Underscore.js, copyright Jeremy Ashkenas,
 * DocumentCloud and Investigative Reporters & Editors <http://underscorejs.org/>
 *
 * Modifications Copyright (c) 2026 GoodData Corporation
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * @internal
 */
export type _List<T> = ArrayLike<T>;

/**
 * @internal
 */
export type _Many<T> = T | readonly T[];

/**
 * @internal
 */
export type _PropertyName = string | number | symbol;

/**
 * @internal
 */
export type _Dictionary<T> = {
    [index: string]: T;
};

/**
 * @internal
 */
export type _NotVoid = unknown;

/**
 * @internal
 */
export type _PartialShallow<T> = {
    [P in keyof T]?: T[P] extends object ? object : T[P];
};

/**
 * @internal
 */
// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export type _IterateeShorthand<T> = _PropertyName | [_PropertyName, any] | _PartialShallow<T>;

/**
 * An iteratee as lodash accepts it: a function, a property name or path, a `[path, value]` pair, or a
 * partial object to match.
 *
 * @internal
 */
export type _ValueIteratee<T> = ((value: T) => _NotVoid) | _IterateeShorthand<T>;

/**
 * A predicate that narrows the element type, so functions like `_partition` can type their result.
 *
 * @internal
 */
export type _ValueIteratorTypeGuard<T, S extends T> = (value: T) => value is S;

/**
 * @internal
 */
export type _ListIterator<T, TResult> = (value: T, index: number, collection: _List<T>) => TResult;

/**
 * @internal
 */
export type _ListIteratee<T> = _ListIterator<T, _NotVoid> | _IterateeShorthand<T>;

/**
 * @internal
 */
export type _ObjectIterator<TObject, TResult> = (
    value: TObject[keyof TObject],
    key: string,
    collection: TObject,
) => TResult;

/**
 * @internal
 */
export type _ObjectIteratee<TObject> =
    | _ObjectIterator<TObject, _NotVoid>
    | _IterateeShorthand<TObject[keyof TObject]>;

/**
 * @internal
 */
export type _PartialObject<T> = Partial<T>;

/**
 * @internal
 */
export type _ValueKeyIteratee<T> = ((value: T, key: string) => _NotVoid) | _IterateeShorthand<T>;

/**
 * @internal
 */
export type _NumericDictionary<T> = {
    [index: number]: T;
};
