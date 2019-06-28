// (C) 2007-2019 GoodData Corporation
import remove = require("lodash/remove");
import cloneDeep = require("lodash/cloneDeep");
import sortedUniq = require("lodash/sortedUniq");
import clone = require("lodash/clone");
import without = require("lodash/without");
import omit = require("lodash/omit");
import sortBy = require("lodash/sortBy");
import get = require("lodash/get");
import { AFM } from "@gooddata/typings";
import { InjectedIntl } from "react-intl";
import {
    isMappingHeaderAttribute,
    isMappingHeaderMeasureItem,
    IMappingHeader,
} from "../../../../interfaces/MappingHeader";
import { IIndexedTotalItem, ITotalWithData } from "../../../../interfaces/Totals";
import { IAlignPoint, ITotalsDataSource, ITotalTypeWithTitle } from "../../../../interfaces/Table";

import { getFooterHeight } from "../utils/layout";

export const AVAILABLE_TOTALS: AFM.TotalType[] = ["sum", "max", "min", "avg", "med", "nat"];

export const isNativeTotal = (total: AFM.ITotalItem) => {
    return total && total.type === "nat";
};

export const getAttributeDimension = (
    attributeIdentifier: string,
    resultSpec: AFM.IResultSpec,
): AFM.IDimension => {
    return resultSpec.dimensions.find(
        dimension => !!dimension.itemIdentifiers.find(attribute => attribute === attributeIdentifier),
    );
};

const getNativeTotalAttributeIdentifiers = (total: AFM.ITotalItem, resultSpec: AFM.IResultSpec): string[] => {
    const attributeIdentifiers = getAttributeDimension(total.attributeIdentifier, resultSpec).itemIdentifiers;

    const totalAttributeIndex = attributeIdentifiers.findIndex(
        attributeIdentifier => attributeIdentifier === total.attributeIdentifier,
    );

    return attributeIdentifiers.slice(0, totalAttributeIndex);
};

export const getNativeTotals = (
    totals: AFM.ITotalItem[],
    resultSpec: AFM.IResultSpec,
): AFM.INativeTotalItem[] => {
    if (!totals) {
        return [];
    }
    const afmNativeTotals: AFM.INativeTotalItem[] = totals
        .filter(total => isNativeTotal(total))
        .map(nativeTotal => ({
            measureIdentifier: nativeTotal.measureIdentifier,
            attributeIdentifiers: getNativeTotalAttributeIdentifiers(nativeTotal, resultSpec),
        }));
    return afmNativeTotals;
};

export const getTotalsFromResultSpec = (resultSpec: AFM.IResultSpec): AFM.ITotalItem[] => {
    return resultSpec && resultSpec.dimensions
        ? resultSpec.dimensions.reduce(
              (totals: AFM.ITotalItem[], dimension) =>
                  dimension && dimension.totals ? totals.concat(dimension.totals) : totals,
              [],
          )
        : [];
};

function getTotalsList(intl: InjectedIntl): ITotalTypeWithTitle[] {
    return AVAILABLE_TOTALS.map(type => ({
        type,
        title: intl.formatMessage({ id: `visualizations.totals.dropdown.title.${type}` }),
    }));
}

export function getTotalsDataSource(usedTotals: ITotalWithData[], intl: InjectedIntl): ITotalsDataSource {
    const usedTotalsTypes: AFM.TotalType[] = usedTotals.map((total: ITotalWithData) => total.type);

    const list: ITotalTypeWithTitle[] = getTotalsList(intl).map((total: ITotalTypeWithTitle) => ({
        ...total,
        disabled: usedTotalsTypes.includes(total.type),
    }));

    list.unshift({
        title: "visualizations.totals.dropdown.heading",
        role: "header",
    });

    return {
        rowsCount: list.length,
        getObjectAt: (index: number) => list[index],
    };
}

export function createTotalItem(
    type: AFM.TotalType,
    outputMeasureIndexes: number[] = [],
    values: number[] = [],
): ITotalWithData {
    return {
        type,
        outputMeasureIndexes,
        values,
    };
}

export function orderTotals(totalsUnordered: IIndexedTotalItem[]): IIndexedTotalItem[] {
    return sortBy(totalsUnordered, total => AVAILABLE_TOTALS.indexOf(total.type));
}

export function toggleCellClass(
    parentReference: Element,
    tableColumnIndex: number,
    isHighlighted: boolean,
    className: string,
): void {
    const cells: NodeListOf<Element> = parentReference.querySelectorAll(`.col-${tableColumnIndex}`);

    Array.from(cells).forEach((cell: Element) => {
        if (isHighlighted) {
            cell.classList.add(className);
        } else {
            cell.classList.remove(className);
        }
    });
}

export function resetRowClass(
    parentReference: Element,
    className: string,
    selector: string,
    rowIndexToBeSet: number = null,
): void {
    const rows: NodeListOf<Element> = parentReference.querySelectorAll(selector);

    Array.from(rows).forEach((r: Element) => r.classList.remove(className));

    if (rows.length && rowIndexToBeSet !== null) {
        const row: Element = rows[rowIndexToBeSet];
        row.classList.add(className);
    }
}

export function removeTotalsRow(
    totals: ITotalWithData[],
    totalItemTypeToRemove: AFM.TotalType,
): ITotalWithData[] {
    const updatedTotals: ITotalWithData[] = cloneDeep(totals);

    remove(updatedTotals, total => total.type === totalItemTypeToRemove);

    return updatedTotals;
}

export function isTotalUsed(totals: ITotalWithData[], totalItemType: AFM.TotalType): boolean {
    return totals.some(row => row.type === totalItemType);
}

export function addTotalsRow(totals: ITotalWithData[], totalItemTypeToAdd: AFM.TotalType): ITotalWithData[] {
    const updatedTotals: ITotalWithData[] = cloneDeep(totals);

    if (isTotalUsed(updatedTotals, totalItemTypeToAdd)) {
        return updatedTotals;
    }

    const total: ITotalWithData = createTotalItem(totalItemTypeToAdd);

    updatedTotals.push(total);

    return updatedTotals;
}

export function updateTotalsRemovePosition(
    tableBoundingRect: ClientRect,
    totals: ITotalWithData[],
    isTotalsEditAllowed: boolean,
    totalsAreVisible: boolean,
    removeWrapper: HTMLElement,
): void {
    if (!isTotalsEditAllowed) {
        return;
    }

    const translateY: number =
        tableBoundingRect.height - getFooterHeight(totals, isTotalsEditAllowed, totalsAreVisible);

    removeWrapper.style.bottom = "auto";
    removeWrapper.style.top = `${translateY}px`;
}

export function getAddTotalDropdownAlignPoints(isLastColumn: boolean = false): IAlignPoint[] {
    return isLastColumn
        ? [
              { align: "tc br", offset: { x: 30, y: -3 } }, // top right
              { align: "bc tr", offset: { x: 30, y: 50 } }, // bottom right
          ]
        : [
              { align: "tc bc", offset: { x: 0, y: -3 } }, // top center
              { align: "bc tc", offset: { x: 0, y: 50 } }, // bottom center
          ];
}

export function shouldShowAddTotalButton(
    header: IMappingHeader,
    isFirstColumn: boolean,
    addingMoreTotalsEnabled: boolean,
): boolean {
    return !isFirstColumn && isMappingHeaderMeasureItem(header) && addingMoreTotalsEnabled;
}

export function getFirstMeasureIndex(headers: IMappingHeader[]): number {
    const measureOffset = headers.findIndex(header => isMappingHeaderMeasureItem(header));
    return measureOffset === -1 ? 0 : measureOffset;
}

export function hasTableColumnTotalEnabled(
    outputMeasureIndexes: number[],
    tableColumnIndex: number,
    firstMeasureIndex: number,
): boolean {
    const index = tableColumnIndex - firstMeasureIndex;

    return outputMeasureIndexes && outputMeasureIndexes.includes(index);
}

export function addMeasureIndex(
    totals: ITotalWithData[],
    headers: IMappingHeader[],
    totalType: AFM.TotalType,
    tableColumnIndex: number,
): ITotalWithData[] {
    const index: number = tableColumnIndex - getFirstMeasureIndex(headers);

    return totals.map((total: ITotalWithData) => {
        if (total.type !== totalType) {
            return total;
        }

        const outputMeasureIndexes: number[] = clone(total.outputMeasureIndexes);
        outputMeasureIndexes.push(index);
        outputMeasureIndexes.sort();

        return {
            ...total,
            outputMeasureIndexes: sortedUniq(outputMeasureIndexes),
        };
    });
}

export function removeMeasureIndex(
    totals: ITotalWithData[],
    headers: IMappingHeader[],
    totalType: AFM.TotalType,
    tableColumnIndex: number,
): ITotalWithData[] {
    const index: number = tableColumnIndex - getFirstMeasureIndex(headers);

    return totals.map((total: ITotalWithData) => {
        if (total.type !== totalType) {
            return total;
        }

        const outputMeasureIndexes: number[] = without(total.outputMeasureIndexes, index);

        return {
            ...total,
            outputMeasureIndexes,
        };
    });
}

export function getTotalsDefinition(totalsWithValues: ITotalWithData[]): IIndexedTotalItem[] {
    const totalsWithoutValues: IIndexedTotalItem[] = totalsWithValues.map(
        (total: IIndexedTotalItem) => omit(total, "values") as IIndexedTotalItem,
    );

    return orderTotals(totalsWithoutValues);
}

export function shouldShowTotals(headers: IMappingHeader[]): boolean {
    if (headers.length < 1) {
        return false;
    }

    const onlyMeasures: boolean = headers.every((header: IMappingHeader) =>
        isMappingHeaderMeasureItem(header),
    );
    const onlyAttributes: boolean = headers.every((header: IMappingHeader) =>
        isMappingHeaderAttribute(header),
    );

    return !(onlyAttributes || onlyMeasures);
}

export const getColumnTotalsFromResultSpec = (source: AFM.IResultSpec) => {
    return get(source, "dimensions[0].totals", []);
};

export default {
    getColumnTotalsFromResultSpec,
};
