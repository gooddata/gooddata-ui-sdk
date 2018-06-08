// (C) 2007-2018 GoodData Corporation
import * as invariant from 'invariant';
import { get, has, omit, zip, isEmpty } from 'lodash';
import { AFM, Execution } from '@gooddata/typings';
import { getAttributeElementIdFromAttributeElementUri } from '../../utils/common';
import { getMeasureUriOrIdentifier, IDrillIntersection } from '../../utils/drilldownEventing';
import {
    IAttributeTableHeader,
    IMeasureTableHeader,
    isAttributeCell,
    TableCell,
    TableHeader,
    TableRow,
    TableRowForDrilling,
    isAttributeTableHeader,
    IAttributeCell,
    MeasureCell
} from '../../../../interfaces/Table';
import { AVAILABLE_TOTALS } from '../totals/utils';
import { IIndexedTotalItem, ITotalWithData } from '../../../../interfaces/Totals';

function getAttributeHeaders(resultDimension: Execution.IResultDimension): IAttributeTableHeader[] {
    return resultDimension.headers
        .map((attributeHeader: Execution.IAttributeHeader) => {
            return {
                ...omit(attributeHeader.attributeHeader, ['formOf', 'totalItems']) as any,
                name: attributeHeader.attributeHeader.formOf.name,
                type: 'attribute'
            };
        });
}

function getMeasureHeaders(resultDimension: Execution.IResultDimension): IMeasureTableHeader[] {
    return get(resultDimension.headers[0], ['measureGroupHeader', 'items'], [])
        .map((measureHeader: Execution.IMeasureHeaderItem) => {
            return {
                ...measureHeader.measureHeaderItem,
                type: 'measure'
            };
        });
}

export function getHeaders(executionResponse: Execution.IExecutionResponse): TableHeader[] {
    const dimensions: Execution.IResultDimension[] = get(executionResponse, 'dimensions', []);

    // two dimensions must be always returned (and requested)
    invariant(dimensions.length === 2, 'Number of dimensions must be equal two');

    // attributes are always returned (and requested) in 0-th dimension
    const attributeHeaders: IAttributeTableHeader[] = getAttributeHeaders(dimensions[0]);

    // measures are always returned (and requested) in 1-st dimension
    const measureHeaders: IMeasureTableHeader[] = getMeasureHeaders(dimensions[1]);

    return [...attributeHeaders, ...measureHeaders];
}

export function getRows(executionResult: Execution.IExecutionResult): TableRow[] {
    // two dimensional headerItems array are always returned (and requested)
    // attributes are always returned (and requested) in 0-th dimension
    const attributeValues: IAttributeCell[][] = executionResult.headerItems[0]
        .filter(// filter only arrays which contains some attribute header items
            (headerItem: Execution.IResultHeaderItem[]) => headerItem
                .some((item: Execution.IResultHeaderItem) => has(item, 'attributeHeaderItem'))
        )
        .map((attributeHeaderItems: Execution.IResultAttributeHeaderItem[]) => attributeHeaderItems
            .map((attributeHeaderItem: Execution.IResultAttributeHeaderItem) => get(
                attributeHeaderItem,
                'attributeHeaderItem'
                ) as IAttributeCell
            )
        );

    const measureValues = get(executionResult, 'data', []);

    const attributeRows = zip(...attributeValues);

    if (measureValues.length === 0) {
        return attributeRows;
    }

    if (attributeRows.length === 0) {
        return measureValues;
    }

    return measureValues.map((measureValue: MeasureCell[], index: number) => {
        return [...attributeRows[index], ...measureValue];
    });
}

function getResultTotalsValues(executionResult: Execution.IExecutionResult): Execution.DataValue[][] {
    const totalsData = executionResult.totals;
    if (!isEmpty(totalsData)) {
        // Totals are requested and returned in the same dimension as attributes,
        // and in case of Table, attributes are always in 0-th dimension
        return totalsData[0];
    }
    return [];
}

function isResultTotalHeaderItem(headerItem: Execution.IResultHeaderItem)
    : headerItem is Execution.IResultTotalHeaderItem {

    return (headerItem as Execution.ITotalHeaderItem).totalHeaderItem !== undefined;
}

function getOrderedTotalTypes(executionResult: Execution.IExecutionResult): string[] {
    // Totals are requested (and returned) in the same dimension as attributes, and in case of Table,
    // attributes are always in 0-th dimension right now, therefore executionResult.headerItems[0].
    // Also, we are now supporting only Grand Totals, so totals will be returned always next to the headerItems
    // of the first attribute, therefore executionResult.headerItems[0][0]
    const headerItems: Execution.IResultHeaderItem[] = get(executionResult, 'headerItems[0][0]', []);

    return headerItems.reduce((types: string[], headerItem: Execution.IResultHeaderItem) => {
        if (isResultTotalHeaderItem(headerItem)) {
            types.push(headerItem.totalHeaderItem.type);
        }
        return types;
    }, []);
}

export function getTotalsWithData(
    totalsDefinition: IIndexedTotalItem[],
    executionResult: Execution.IExecutionResult
): ITotalWithData[] {
    const totalsResultValues: Execution.DataValue[][] = getResultTotalsValues(executionResult);
    if (isEmpty(totalsDefinition)) {
        return [];
    }

    let orderedTotalsTypes = getOrderedTotalTypes(executionResult);

    if (!orderedTotalsTypes.length) {
        orderedTotalsTypes = AVAILABLE_TOTALS;
    }

    let index: number = 0;
    return orderedTotalsTypes.reduce((totals: ITotalWithData[], type: string) => {
        const totalDefinition: IIndexedTotalItem = totalsDefinition.find(
            (total: IIndexedTotalItem) => total.type === type
        );

        if (totalDefinition) {
            totals.push({
                ...totalDefinition,
                values: isEmpty(totalsResultValues) ? [] : (totalsResultValues[index] || [])
            });
            index += 1;
        }

        return totals;
    }, []);
}

export function validateTableProportions(headers: TableHeader[], rows: TableRow[]): void {
    invariant(
        rows.length === 0 || headers.length === rows[0].length,
        'Number of table columns must be equal to number of table headers'
    );
}

export function getIntersectionForDrilling(afm: AFM.IAfm, header: TableHeader): IDrillIntersection {
    return isAttributeTableHeader(header)
        ? {
            id: header.identifier,
            identifier: header.identifier,
            uri: header.uri,
            title: header.name
        }
        : {
            id: header.localIdentifier,
            identifier: '',
            uri: get(getMeasureUriOrIdentifier(afm, header.localIdentifier), 'uri') as string,
            title: header.name
        };
}

export function getBackwardCompatibleRowForDrilling(row: TableRow): TableRowForDrilling {
    return row.map((cell: TableCell) => {
        return isAttributeCell(cell)
            ? {
                id: getAttributeElementIdFromAttributeElementUri(cell.uri),
                name: cell.name
            }
            : cell;
    });
}
