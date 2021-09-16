// (C) 2021 GoodData Corporation

/**
 * Function that can be used to sort collections. The semantics are the same as the first argument to Array#sort function.
 * @public
 */
export type IComparator<T> = (a: T, b: T) => number;

/**
 * Direction of the comparator.
 * @public
 */
export type ComparatorDirection = "asc" | "desc";

/**
 * Creates a new string-based comparator.
 *
 * @internal
 */
export const stringComparatorFactory =
    <TInput>(valueAccessor: (obj: TInput) => string | undefined) =>
    (direction: ComparatorDirection): IComparator<TInput> => {
        return (a, b) => {
            const aValue = valueAccessor(a);
            const bValue = valueAccessor(b);

            if (aValue === bValue) {
                return 0;
            }

            // undefined must be sorted at the "high" end of the collection
            if (aValue === undefined) {
                return direction === "asc" ? 1 : -1;
            }

            if (bValue === undefined) {
                return direction === "asc" ? -1 : 1;
            }

            const result = aValue?.localeCompare(bValue);
            return direction === "asc" ? result : -result;
        };
    };
/**
 * Creates a new date-string-based comparator.
 *
 * @internal
 */
export const dateStringComparatorFactory =
    <TInput>(valueAccessor: (obj: TInput) => string | undefined) =>
    (direction: ComparatorDirection): IComparator<TInput> => {
        return (a, b) => {
            const aRawValue = valueAccessor(a);
            const bRawValue = valueAccessor(b);

            const aValue = aRawValue ? +new Date(aRawValue) : undefined;
            const bValue = bRawValue ? +new Date(bRawValue) : undefined;

            if (aValue === bValue) {
                return 0;
            }

            // undefined must be sorted at the "high" end of the collection
            if (aValue === undefined) {
                return direction === "asc" ? 1 : -1;
            }

            if (bValue === undefined) {
                return direction === "asc" ? -1 : 1;
            }

            const result = aValue - bValue;
            return direction === "asc" ? result : -result;
        };
    };
