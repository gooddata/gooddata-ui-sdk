// (C) 2007-2020 GoodData Corporation

/**
 * Shift array once to the right
 *
 * @param array some array
 * @internal
 */
export function shiftArrayRight<T>(array: Array<T>): Array<T> {
    if (!array?.length) {
        return array;
    }

    const [last, ...res] = [...array].reverse();
    return [last, ...res.reverse()];
}
