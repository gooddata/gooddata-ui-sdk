// (C) 2025 GoodData Corporation

/**
 * Size calculation functions for GeoPushpinChartNext
 *
 * @internal
 */

/**
 * Interface for min/max value pair
 */
interface IMinMax {
    min?: number;
    max?: number;
}

/**
 * Calculates the average of an array of numbers
 *
 * @param values - Array of numbers to average
 * @returns Average value, or 0 if array is empty
 *
 * @internal
 */
export function calculateAverage(values: number[] = []): number {
    if (values.length === 0) {
        return 0;
    }
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Gets minimum and maximum values from a number array, ignoring non-finite values
 *
 * @param data - Array of numbers
 * @returns Object containing min and max values (may be undefined if no finite values exist)
 *
 * @internal
 */
export function getMinMax(data: number[]): IMinMax {
    return data.reduce(
        (result: IMinMax, value: number): IMinMax => {
            if (!isFinite(value)) {
                return result;
            }
            const min =
                result.min !== undefined && isFinite(result.min) ? Math.min(value, result.min) : value;
            const max =
                result.max !== undefined && isFinite(result.max) ? Math.max(value, result.max) : value;
            return { min, max };
        },
        {
            min: undefined,
            max: undefined,
        },
    );
}
