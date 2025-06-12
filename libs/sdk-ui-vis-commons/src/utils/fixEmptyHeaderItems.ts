// (C) 2007-2023 GoodData Corporation
import { IDataView } from "@gooddata/sdk-backend-spi";
import { isResultAttributeHeader, isResultMeasureHeader, isResultTotalHeader } from "@gooddata/sdk-model";

/**
 * This function will mutate the incoming data view and replace headers with empty name with a fallback
 * string. This is so that we can show "(empty)" or similar strings in the UI.
 *
 * @param dataView - view to mutate
 * @param emptyHeaderString - value to use for empty strings
 * @deprecated try to avoid using this function and handle empty headers when displaying them
 * @public
 */
export function fixEmptyHeaderItems(dataView: IDataView, emptyHeaderString: string): void {
    dataView.headerItems.forEach((dim) => {
        dim.forEach((attr) => {
            attr.forEach((item) => {
                if (isResultAttributeHeader(item)) {
                    item.attributeHeaderItem.name = item.attributeHeaderItem.name || emptyHeaderString;
                } else if (isResultMeasureHeader(item)) {
                    item.measureHeaderItem.name = item.measureHeaderItem.name || emptyHeaderString;
                } else if (isResultTotalHeader(item)) {
                    item.totalHeaderItem.name = item.totalHeaderItem.name || emptyHeaderString;
                }
            });
        });
    });
}
