// (C) 2019-2025 GoodData Corporation
import { IBucketsInfo } from "./collectBucketsInfo.js";

/**
 * @internal
 */
export function collectPivotingInfo({ columnAttributes }: IBucketsInfo) {
    const hasColumnAttributes = columnAttributes.length > 0;
    const isPivoted = hasColumnAttributes;

    return {
        isPivoted,
    };
}
