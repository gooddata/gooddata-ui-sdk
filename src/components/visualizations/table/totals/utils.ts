// (C) 2007-2018 GoodData Corporation
import { remove, cloneDeep, sortedUniq, clone, without, omit, sortBy } from 'lodash';
import { AFM } from '@gooddata/typings';
import { InjectedIntl } from 'react-intl';
import { IIndexedTotalItem, ITotalWithData } from '../../../../interfaces/Totals';
import {
    IAlignPoint,
    isAttributeTableHeader,
    isMeasureTableHeader,
    ITotalsDataSource,
    ITotalTypeWithTitle,
    TableHeader
} from '../../../../interfaces/Table';

import { getFooterHeight } from '../utils/footer';

export const AVAILABLE_TOTALS: AFM.TotalType[] = [
    'sum',
    'max',
    'min',
    'avg',
    'med',
    'nat'
];

function getTotalsList(intl: InjectedIntl): ITotalTypeWithTitle[] {
    return AVAILABLE_TOTALS.map(type => ({
        type,
        title: intl.formatMessage({ id: `visualizations.totals.dropdown.title.${type}` })
    }));
}

export function getTotalsDataSource(usedTotals: ITotalWithData[], intl: InjectedIntl): ITotalsDataSource {
    const usedTotalsTypes: AFM.TotalType[] = usedTotals.map((total: ITotalWithData) => total.type);

    const list: ITotalTypeWithTitle[] = getTotalsList(intl)
        .map((total: ITotalTypeWithTitle) => ({
            ...total,
            disabled: usedTotalsTypes.includes(total.type)
        }));

    list.unshift({
        title: 'visualizations.totals.dropdown.heading',
        role: 'header'
    });

    return {
        rowsCount: list.length,
        getObjectAt: (index: number) => list[index]
    };
}

export function createTotalItem(
    type: AFM.TotalType,
    outputMeasureIndexes: number[] = [],
    values: number[] = []
): ITotalWithData {
    return {
        type,
        outputMeasureIndexes,
        values
    };
}

export function orderTotals(totalsUnordered: IIndexedTotalItem[]): IIndexedTotalItem[] {
    return sortBy(totalsUnordered, total => AVAILABLE_TOTALS.indexOf(total.type));
}

export function toggleCellClass(
    parentReference: Element,
    tableColumnIndex: number,
    isHighlighted: boolean,
    className: string
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
    rowIndexToBeSet: number = null
): void {
    const rows: NodeListOf<Element> = parentReference.querySelectorAll(selector);

    Array.from(rows).forEach((r: Element) => r.classList.remove(className));

    if (rows.length && rowIndexToBeSet !== null) {
        const row: Element = rows[rowIndexToBeSet];
        row.classList.add(className);
    }
}

export function removeTotalsRow(totals: ITotalWithData[], totalItemTypeToRemove: AFM.TotalType): ITotalWithData[] {
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
    removeWrapper: HTMLElement
): void {
    if (!isTotalsEditAllowed) {
        return;
    }

    const translateY: number = tableBoundingRect.height - getFooterHeight(
        totals,
        isTotalsEditAllowed,
        totalsAreVisible
    );

    removeWrapper.style.bottom = 'auto';
    removeWrapper.style.top = `${translateY}px`;
}

export function getAddTotalDropdownAlignPoints(isLastColumn: boolean = false): IAlignPoint {
    return isLastColumn ?
        ({ align: 'tc br', offset: { x: 30, y: -3 } }) :
        ({ align: 'tc bc', offset: { x: 0, y: -3 } });
}

export function shouldShowAddTotalButton(
    header: TableHeader,
    isFirstColumn: boolean,
    addingMoreTotalsEnabled: boolean
): boolean {
    return !isFirstColumn && isMeasureTableHeader(header) && addingMoreTotalsEnabled;
}

export function getFirstMeasureIndex(headers: TableHeader[]): number {
    const measureOffset = headers.findIndex(header => isMeasureTableHeader(header));
    return measureOffset === -1 ? 0 : measureOffset;
}

export function hasTableColumnTotalEnabled(
    outputMeasureIndexes: number[],
    tableColumnIndex: number,
    firstMeasureIndex: number
): boolean {
    const index = tableColumnIndex - firstMeasureIndex;

    return outputMeasureIndexes && outputMeasureIndexes.includes(index);
}

export function addMeasureIndex(
    totals: ITotalWithData[],
    headers: TableHeader[],
    totalType: AFM.TotalType,
    tableColumnIndex: number
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
            outputMeasureIndexes: sortedUniq(outputMeasureIndexes)
        };
    });
}

export function removeMeasureIndex(
    totals: ITotalWithData[],
    headers: TableHeader[],
    totalType: AFM.TotalType,
    tableColumnIndex: number
): ITotalWithData[] {
    const index: number = tableColumnIndex - getFirstMeasureIndex(headers);

    return totals.map((total: ITotalWithData) => {
        if (total.type !== totalType) {
            return total;
        }

        const outputMeasureIndexes: number[] = without(total.outputMeasureIndexes, index);

        return {
            ...total,
            outputMeasureIndexes
        };
    });
}

export function getTotalsDefinition(totalsWithValues: ITotalWithData[]): IIndexedTotalItem[] {
    const totalsWithoutValues: IIndexedTotalItem[] = totalsWithValues
        .map((total: IIndexedTotalItem) => omit(total, 'values') as IIndexedTotalItem);

    return orderTotals(totalsWithoutValues);
}

export function shouldShowTotals(headers: TableHeader[]): boolean {
    if (headers.length < 1) {
        return false;
    }

    const onlyMeasures: boolean = headers.every((header: TableHeader) => isMeasureTableHeader(header));
    const onlyAttributes: boolean = headers.every((header: TableHeader) => isAttributeTableHeader(header));

    return !(onlyAttributes || onlyMeasures);
}
