// (C) 2019-2020 GoodData Corporation

import { Execution } from "@gooddata/api-client-tiger";
import isEqual = require("lodash/isEqual");
import IDimensionHeader = Execution.IDimensionHeader;

function trimData(data: any, offset: number[], size: number[]) {
    if (size.length === 1) {
        return data.slice(offset[0], offset[0] + size[0]);
    } else {
        const result = [];

        for (let i = offset[0]; i < offset[0] + size[0]; i++) {
            const row = data[i];

            result.push(row.slice(offset[1], offset[1] + size[1]));
        }

        return result;
    }
}

/**
 * This function exists to supplement missing paging support for tiger. While tiger supports size/offset on query
 * parameters, it will always return all available data.
 *
 * This does not play well with pivot table; where we need the correct window. Until the paging in tiger arrives,
 * this code will trim result to the requested window.
 *
 * This code is simplistic, does not take care of totals or anything else.
 *
 * @param result
 * @param requestedSize
 * @param requestedOffset
 */
export function trimToRequestedWindow(
    result: Execution.IExecutionResult,
    requestedOffset: number[],
    requestedSize: number[],
): Execution.IExecutionResult {
    const { count: backendCount, total: backendTotal } = result.paging;

    if (!isEqual(backendCount, backendTotal)) {
        /*
         * If this hits, then backend returned less data than total in result set => server-side paging is in
         */
        return result;
    }

    const effectiveOffset = backendTotal.map((totalSize, dimIdx) =>
        Math.max(Math.min(totalSize - 1, requestedOffset[dimIdx]), 0),
    );
    const effectiveSize = backendTotal.map((totalSize, dimIdx) => Math.min(totalSize, requestedSize[dimIdx]));

    const dimensionHeaders = result.dimensionHeaders?.map((dimHeaders, dimIdx) => {
        const newHeader: IDimensionHeader = {
            headerGroups: dimHeaders.headerGroups.map((header) => {
                return {
                    headers: header.headers.slice(
                        effectiveOffset[dimIdx],
                        effectiveOffset[dimIdx] + effectiveSize[dimIdx],
                    ),
                };
            }),
        };
        return newHeader;
    });

    const data = trimData(result.data, effectiveOffset, effectiveSize);

    return {
        paging: {
            offset: effectiveOffset,
            count: effectiveSize,
            total: backendTotal,
        },
        data,
        dimensionHeaders,
    };
}
