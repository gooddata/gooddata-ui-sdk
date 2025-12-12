// (C) 2007-2025 GoodData Corporation
import { once } from "lodash-es";

import {
    type IAttributeDescriptor,
    type IExecutionDefinition,
    type ISortItem,
    type ITotal,
    bucketTotals,
    bucketsFind,
    sanitizeBucketTotals,
} from "@gooddata/sdk-model";
import { BucketNames, type DataViewFacade } from "@gooddata/sdk-ui";

import {
    type ColumnWidthItem,
    isAttributeColumnWidthItem,
    isMeasureColumnWidthItem,
    isMixedValuesColumnWidthItem,
    isSliceMeasureColumnWidthItem,
} from "../columnWidths.js";

function getScrollbarWidthBody(): number {
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    document.body.appendChild(outer);

    const widthNoScroll = outer.offsetWidth;
    // force scrollbars
    outer.style.overflow = "scroll";

    // add inner div
    const inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);

    const widthWithScroll = inner.offsetWidth;

    // remove divs
    outer.parentNode?.removeChild(outer);

    return widthNoScroll - widthWithScroll;
}

/**
 * Returns the current actual scrollbar width.
 * For performance reasons this is memoized as the value is highly unlikely to change
 */
export const getScrollbarWidth = once(getScrollbarWidthBody);

export async function sleep(delay: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}

/**
 * Get only valid totals from an execution definition given a list of sort items
 * Use provided totals, if not given, use totals from ATTRIBUTE bucket
 *
 * @param definition - an execution definition to sanitize
 * @param sortItems - a specification of the sort, if not provided definition.sortBy will be used
 * @param totals - totals to be sanitized, if not provided ATTRIBUTE bucket totals will be used
 */
export function sanitizeDefTotals(
    definition: IExecutionDefinition,
    sortItems?: ISortItem[],
    totals?: ITotal[],
): ITotal[] {
    const { buckets, sortBy } = definition;
    const attributeBucket = bucketsFind(buckets, BucketNames.ATTRIBUTE);
    return attributeBucket
        ? sanitizeBucketTotals(attributeBucket, sortItems ?? sortBy, totals ?? bucketTotals(attributeBucket))
        : [];
}

/**
 * Get totals from an execution definition for COLUMNS bucket
 *
 * @param definition - an execution definition from which totals should be extracted
 */
export function getTotalsForColumnsBucket({ buckets }: IExecutionDefinition): ITotal[] {
    const attributeBucket = bucketsFind(buckets, BucketNames.COLUMNS);
    return attributeBucket ? bucketTotals(attributeBucket) : [];
}

export const tableHasRowAttributes = (rowAttributes: IAttributeDescriptor[]): boolean =>
    rowAttributes.length > 0;

export const tableHasColumnAttributes = (columnAttributes: IAttributeDescriptor[]): boolean =>
    columnAttributes.length > 0;

export const isStrongColumnWidthItem = (item: ColumnWidthItem) => {
    const isAttributeOrMeasureColumnWidthItem =
        isAttributeColumnWidthItem(item) || isMeasureColumnWidthItem(item);
    const isTransposedMeasureColumnWidthItem =
        isSliceMeasureColumnWidthItem(item) || isMixedValuesColumnWidthItem(item);

    return isAttributeOrMeasureColumnWidthItem || isTransposedMeasureColumnWidthItem;
};

export const getDataViewSeriesDescriptors = (dv: DataViewFacade) =>
    dv
        .data()
        .series()
        .toArray()
        .map((series) => series.descriptor)
        .filter(
            (descriptor, index, self) =>
                self.findIndex((s) => s.measureDescriptor === descriptor.measureDescriptor) === index,
        );
