// (C) 2007-2021 GoodData Corporation
import { AnyCol, isSeriesCol } from "./tableDescriptorTypes.js";

/**
 * Returns localId of measure whose values the provided column contains. For convenience, any type of column
 * can be provided and undefined is returned if the column is not of type that contains measure values.
 *
 * @param col - column descriptor
 */
export function colMeasureLocalId(col: AnyCol): string | undefined {
    return isSeriesCol(col)
        ? col.seriesDescriptor.measureDescriptor.measureHeaderItem.localIdentifier
        : undefined;
}
