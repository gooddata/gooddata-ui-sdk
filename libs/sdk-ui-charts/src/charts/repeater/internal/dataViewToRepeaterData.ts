// (C) 2024 GoodData Corporation

import {
    IResultAttributeHeader,
    IResultAttributeHeaderItem,
    attributeDescriptorLocalId,
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
} from "@gooddata/sdk-model";
import { DataViewFacade } from "@gooddata/sdk-ui";

/**
 * Key is the localId of the attribute or measure.
 *
 * For row, or column attributes, value is IResultAttributeHeaderItem
 * For slicing attribute, value is array of IResultAttributeHeaderItem.
 * For measure(s), value is array of string or nulls (formatted values).
 */
export type IRepeaterRow = Record<
    string,
    IResultAttributeHeaderItem | IResultAttributeHeaderItem[] | (string | null)[]
>;

/**
 * Map data view to a structure that can be easily rendered in a table (repeater).
 *
 * Execution is always constructed by the following rules:
 *  - It always contains 1 main row attribute
 *  - It can contain 0..n column attributes
 *  - Column attributes have always the same count of headers as the main row attribute
 *  - It can contain 0..n measures
 *  - It can contain 0 or 1 slicing attribute.
 */
export function dataViewToRepeaterData(dataViewFacade: DataViewFacade): IRepeaterRow[] {
    const rows: IRepeaterRow[] = [];
    const [firstDimDescriptors, secondDimDescriptors] = [
        dataViewFacade.meta().dimensionItemDescriptors(0),
        dataViewFacade.meta().dimensionItemDescriptors(1),
    ];

    const [firstDimHeaders, secondDimHeaders] = dataViewFacade.meta().allHeaders();

    // Process first dimension (row and column attributes)
    firstDimDescriptors.forEach((dimDescriptor, headerIndex) => {
        if (isAttributeDescriptor(dimDescriptor)) {
            const localId = attributeDescriptorLocalId(dimDescriptor);
            firstDimHeaders[headerIndex].forEach((headerItem, itemIndex) => {
                rows[itemIndex] = rows[itemIndex] || {};
                rows[itemIndex][localId] = (headerItem as IResultAttributeHeader).attributeHeaderItem;
            });
        }
    });

    // Process second dimension (slicing attribute and measures)
    secondDimDescriptors.forEach((dimDescriptor) => {
        if (isAttributeDescriptor(dimDescriptor)) {
            const localId = attributeDescriptorLocalId(dimDescriptor);
            const headerItems = secondDimHeaders[secondDimDescriptors.indexOf(dimDescriptor)];
            // Slicing attribute is same for each row
            rows.forEach((row) => {
                row[localId] = (headerItems as IResultAttributeHeader[]).map(
                    (header) => header.attributeHeaderItem,
                );
            });
        } else if (isMeasureGroupDescriptor(dimDescriptor)) {
            // Map each measure to rows
            dimDescriptor.measureGroupHeader.items.forEach((measureDescriptor) => {
                const allSeries = dataViewFacade
                    .data()
                    .series()
                    .allForMeasure(measureDescriptor.measureHeaderItem.localIdentifier);
                // Map each measure series to rows
                [...allSeries].forEach((series, seriesIndex) => {
                    // Map data points to relevant rows and respective measure
                    series.dataPoints().forEach((dataPoint, pointIndex) => {
                        const measureLocalId = measureDescriptor.measureHeaderItem.localIdentifier;
                        rows[pointIndex][measureLocalId] = rows[pointIndex][measureLocalId] || [];
                        (rows[pointIndex][measureLocalId] as (null | string)[])[seriesIndex] =
                            dataPoint.formattedValue();
                    });
                });
            });
        }
    });

    return rows;
}
