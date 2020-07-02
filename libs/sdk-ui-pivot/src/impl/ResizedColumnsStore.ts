// (C) 2007-2020 GoodData Corporation
// tslint:disable:prefer-conditional-expression
import { ColDef, Column } from "@ag-grid-community/all-modules";
import omit = require("lodash/omit");
import partition = require("lodash/partition");

import { getColumnIdentifier, isMeasureColumn } from "./agGridUtils";
import {
    getColumnWidthsFromMap,
    convertColumnWidthsToMap,
    defaultWidthValidator,
} from "./agGridColumnSizing";
import {
    ColumnWidth,
    isColumnWidthAuto,
    ColumnWidthItem,
    isAllMeasureColumnWidthItem,
    isAbsoluteColumnWidth,
    IAllMeasureColumnWidthItem,
} from "../columnWidths";
import { ColumnEventSourceType, IResizedColumnsItem } from "../types";
import { DataViewFacade } from "@gooddata/sdk-ui";

export interface IResizedColumnsCollection {
    [columnIdentifier: string]: IResizedColumnsCollectionItem;
}

export interface IResizedColumnsCollectionItem {
    width: ColumnWidth;
    source: ColumnEventSourceType;
}

export class ResizedColumnsStore {
    private manuallyResizedColumns: IResizedColumnsCollection;
    private allMeasureColumnWidth: number | null;

    public constructor() {
        this.manuallyResizedColumns = {};
        this.allMeasureColumnWidth = null;
    }

    public getManuallyResizedColumn(item: Column | ColDef): IResizedColumnsItem {
        const colId = getColumnIdentifier(item);

        if (this.manuallyResizedColumns[colId]) {
            return this.convertItem(this.manuallyResizedColumns[colId]);
        }

        if (isMeasureColumn(item) && this.isAllMeasureColumWidthUsed()) {
            return this.getAllMeasureColumMapItem();
        }
    }

    public isColumnManuallyResized(item: Column | ColDef) {
        return !!this.getManuallyResizedColumn(item);
    }

    public addToManuallyResizedColumn(column: Column): void {
        this.manuallyResizedColumns[getColumnIdentifier(column)] = {
            width: column.getActualWidth(),
            source: ColumnEventSourceType.UI_DRAGGED,
        };

        column.getColDef().suppressSizeToFit = true;
    }

    public addAllMeasureColumns(columnWidth: number, allColumns: Column[]) {
        this.allMeasureColumnWidth = columnWidth;
        allColumns.forEach((col) => {
            if (isMeasureColumn(col)) {
                const colId = getColumnIdentifier(col);
                if (this.manuallyResizedColumns[colId]) {
                    this.manuallyResizedColumns = omit(this.manuallyResizedColumns, colId);
                }
                col.getColDef().suppressSizeToFit = true;
            }
        });
    }

    public removeAllMeasureColumns() {
        this.allMeasureColumnWidth = null;
        const colIds = Object.keys(this.manuallyResizedColumns);
        colIds.forEach((colId) => {
            const item = this.manuallyResizedColumns[colId];
            if (isColumnWidthAuto(item.width)) {
                this.manuallyResizedColumns = omit(this.manuallyResizedColumns, colId);
            }
        });
    }

    public removeFromManuallyResizedColumn(column: Column): void {
        const colId = getColumnIdentifier(column);
        const item = this.manuallyResizedColumns[colId];

        if (item) {
            this.manuallyResizedColumns = omit(this.manuallyResizedColumns, colId);

            if (!this.isAllMeasureColumWidthUsed() || !isMeasureColumn(column)) {
                column.getColDef().suppressSizeToFit = false;
            }
        }

        if (this.isAllMeasureColumWidthUsed() && isMeasureColumn(column)) {
            this.manuallyResizedColumns[colId] = this.getAutoSizeItem();
            column.getColDef().suppressSizeToFit = false;
        }
    }

    public getColumnWidthsFromMap(dv: DataViewFacade): ColumnWidthItem[] {
        const result = getColumnWidthsFromMap(this.manuallyResizedColumns, dv);
        if (this.isAllMeasureColumWidthUsed()) {
            result.push(this.getAllMeasureColumnWidth());
        }
        return result;
    }

    public updateColumnWidths(columnWidths: ColumnWidthItem[], dv: DataViewFacade) {
        const [allMeasureColumnWidthItems, columnWidthItems] = partition(columnWidths, (item) =>
            isAllMeasureColumnWidthItem(item),
        );

        const allMeasureWidthItem = allMeasureColumnWidthItems[0];

        if (isAllMeasureColumnWidthItem(allMeasureWidthItem)) {
            const validatedWidth = defaultWidthValidator(allMeasureWidthItem.measureColumnWidthItem.width);
            this.allMeasureColumnWidth = isAbsoluteColumnWidth(validatedWidth) ? validatedWidth : null;
        } else {
            this.allMeasureColumnWidth = null;
        }

        const columnWidthsByField = convertColumnWidthsToMap(columnWidthItems, dv);
        this.manuallyResizedColumns = columnWidthsByField;
    }

    private convertItem(item: IResizedColumnsCollectionItem): IResizedColumnsItem {
        // columns with width = auto are hidden
        if (isAbsoluteColumnWidth(item.width)) {
            return {
                width: item.width,
                source: item.source,
            };
        }
    }

    private isAllMeasureColumWidthUsed() {
        return this.allMeasureColumnWidth !== null;
    }

    private getAutoSizeItem(): IResizedColumnsCollectionItem {
        return { width: "auto", source: ColumnEventSourceType.UI_DRAGGED };
    }

    private getAllMeasureColumMapItem(): IResizedColumnsItem {
        return { width: this.allMeasureColumnWidth, source: ColumnEventSourceType.UI_DRAGGED };
    }

    private getAllMeasureColumnWidth(): IAllMeasureColumnWidthItem {
        return {
            measureColumnWidthItem: {
                width: this.allMeasureColumnWidth,
            },
        };
    }
}
