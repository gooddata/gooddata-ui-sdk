// (C) 2019-2025 GoodData Corporation
import { IDataView } from "@gooddata/sdk-backend-spi";
import {
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
    isResultAttributeHeader,
    isResultMeasureHeader,
    isResultTotalHeader,
} from "@gooddata/sdk-model";

import { ITableDataHeaderScope } from "../../interfaces/scope.js";

/**
 * @internal
 */
export type IHeadersInfo = {
    rowHeaders: ITableDataRowScope[];
    columnHeaders: ITableDataColumnScope[];
};

/**
 * @internal
 */
type ITableDataColumnScope = {
    type: "column";
    index: number;
    columnScope: ITableDataHeaderScope[];
};

/**
 * @internal
 */
type ITableDataRowScope = {
    type: "row";
    index: number;
    rowScope: ITableDataHeaderScope[];
};

/**
 * @internal
 */
export function collectHeadersInfo(dataView: IDataView) {
    const dimensions = dataView.result.dimensions;
    const headerItems = dataView.headerItems;

    const rowHeaders: ITableDataRowScope[] = [];
    const columnHeaders: ITableDataColumnScope[] = [];

    dimensions.forEach((dimension, dimensionIndex) => {
        const dimensionItems = dimension.headers;
        dimensionItems.forEach((dimensionItemDescriptor, dimensionItemIndex) => {
            const dimensionHeaders = headerItems[dimensionIndex][dimensionItemIndex];

            // Rows (dimensionIndex === 0)
            if (dimensionIndex === 0) {
                if (isAttributeDescriptor(dimensionItemDescriptor)) {
                    dimensionHeaders.forEach((header, rowIndex) => {
                        if (!rowHeaders[rowIndex]) {
                            rowHeaders[rowIndex] = {
                                type: "row",
                                index: rowIndex,
                                rowScope: [],
                            };
                        }

                        if (isResultAttributeHeader(header)) {
                            rowHeaders[rowIndex].rowScope[dimensionItemIndex] = {
                                type: "attributeScope",
                                descriptor: dimensionItemDescriptor,
                                header: header,
                            };
                        } else if (isResultTotalHeader(header)) {
                            rowHeaders[rowIndex].rowScope[dimensionItemIndex] = {
                                type: "attributeTotalScope",
                                descriptor: dimensionItemDescriptor,
                                header: header,
                            };
                        }
                    });
                } else if (isMeasureGroupDescriptor(dimensionItemDescriptor)) {
                    dimensionHeaders.forEach((header, rowIndex) => {
                        if (!rowHeaders[rowIndex]) {
                            rowHeaders[rowIndex] = {
                                type: "row",
                                index: rowIndex,
                                rowScope: [],
                            };
                        }
                        if (isResultMeasureHeader(header)) {
                            rowHeaders[rowIndex].rowScope[dimensionItemIndex] = {
                                type: "measureScope",
                                descriptor:
                                    dimensionItemDescriptor.measureGroupHeader.items[
                                        header.measureHeaderItem.order
                                    ],
                                header,
                            };
                        } else if (isResultTotalHeader(header)) {
                            rowHeaders[rowIndex].rowScope[dimensionItemIndex] = {
                                type: "measureTotalScope",
                                descriptor:
                                    dimensionItemDescriptor.measureGroupHeader.items[
                                        header.totalHeaderItem.measureIndex!
                                    ],
                                header,
                            };
                        }
                    });
                }
            }

            // Columns (dimensionIndex === 1)
            if (dimensionIndex === 1) {
                if (isAttributeDescriptor(dimensionItemDescriptor)) {
                    dimensionHeaders.forEach((header, columnIndex) => {
                        if (!columnHeaders[columnIndex]) {
                            columnHeaders[columnIndex] = {
                                type: "column",
                                index: columnIndex,
                                columnScope: [],
                            };
                        }

                        if (isResultAttributeHeader(header)) {
                            columnHeaders[columnIndex].columnScope[dimensionItemIndex] = {
                                type: "attributeScope",
                                descriptor: dimensionItemDescriptor,
                                header: header,
                            };
                        } else if (isResultTotalHeader(header)) {
                            columnHeaders[columnIndex].columnScope[dimensionItemIndex] = {
                                type: "attributeTotalScope",
                                descriptor: dimensionItemDescriptor,
                                header: header,
                            };
                        }
                    });
                } else if (isMeasureGroupDescriptor(dimensionItemDescriptor)) {
                    dimensionHeaders.forEach((header, columnIndex) => {
                        if (!columnHeaders[columnIndex]) {
                            columnHeaders[columnIndex] = {
                                type: "column",
                                index: columnIndex,
                                columnScope: [],
                            };
                        }
                        if (isResultMeasureHeader(header)) {
                            columnHeaders[columnIndex].columnScope[dimensionItemIndex] = {
                                type: "measureScope",
                                descriptor:
                                    dimensionItemDescriptor.measureGroupHeader.items[
                                        header.measureHeaderItem.order
                                    ],
                                header,
                            };
                        } else if (isResultTotalHeader(header)) {
                            columnHeaders[columnIndex].columnScope[dimensionItemIndex] = {
                                type: "measureTotalScope",
                                descriptor:
                                    dimensionItemDescriptor.measureGroupHeader.items[
                                        header.totalHeaderItem.measureIndex!
                                    ],
                                header,
                            };
                        }
                    });
                }
            }
        });
    });

    return {
        rowHeaders,
        columnHeaders,
    };
}
