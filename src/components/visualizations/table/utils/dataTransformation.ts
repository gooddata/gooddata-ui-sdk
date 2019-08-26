// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";
import * as invariant from "invariant";
import get = require("lodash/get");
import has = require("lodash/has");
import isEmpty = require("lodash/isEmpty");
import zip = require("lodash/zip");
import {
    getMappingHeaderIdentifier,
    getMappingHeaderLocalIdentifier,
    getMappingHeaderName,
    getMappingHeaderUri,
} from "../../../../helpers/mappingHeader";
import { IDrillEventIntersectionElement } from "../../../../interfaces/DrillEvents";
import {
    IMappingHeader,
    isMappingHeaderAttribute,
    isMappingHeaderMeasureItem,
} from "../../../../interfaces/MappingHeader";
import {
    IAttributeCell,
    isAttributeCell,
    MeasureCell,
    TableCell,
    TableRow,
    TableRowForDrilling,
} from "../../../../interfaces/Table";
import { IIndexedTotalItem, ITotalWithData } from "../../../../interfaces/Totals";
import { getAttributeElementIdFromAttributeElementUri } from "../../utils/common";
import { getMasterMeasureObjQualifier } from "../../../../helpers/afmHelper";
import { createDrillIntersectionElement } from "../../utils/drilldownEventing";
import { AVAILABLE_TOTALS } from "../totals/utils";

export function getHeaders(executionResponse: Execution.IExecutionResponse): IMappingHeader[] {
    const dimensions: Execution.IResultDimension[] = get(executionResponse, "dimensions", []);

    // two dimensions must be always returned (and requested)
    invariant(dimensions.length === 2, "Number of dimensions must be equal two");

    // attributes are always returned (and requested) in 0-th dimension
    const attributeHeaders = dimensions[0].headers.filter(
        Execution.isAttributeHeader,
    ) as Execution.IAttributeHeader[];

    // measures are always returned (and requested) in 1-st dimension
    const measureHeaders = get(
        dimensions[1].headers.find(Execution.isMeasureGroupHeader),
        ["measureGroupHeader", "items"],
        [],
    );

    return [...attributeHeaders, ...measureHeaders];
}

function isMatrix(
    dataValues: Execution.DataValue[] | Execution.DataValue[][],
): dataValues is Execution.DataValue[][] {
    return dataValues[0] instanceof Array;
}

export function getRows(executionResult: Execution.IExecutionResult): TableRow[] {
    // two dimensional headerItems array are always returned (and requested)
    // attributes are always returned (and requested) in 0-th dimension
    const attributeValues: IAttributeCell[][] = executionResult.headerItems[0]
        .filter(
            // filter only arrays which contains some attribute header items
            (headerItem: Execution.IResultHeaderItem[]) =>
                headerItem.some((item: Execution.IResultHeaderItem) => has(item, "attributeHeaderItem")),
        )
        .map((attributeHeaderItems: Execution.IResultAttributeHeaderItem[]) =>
            attributeHeaderItems.map(
                (attributeHeaderItem: Execution.IResultAttributeHeaderItem) =>
                    get(attributeHeaderItem, "attributeHeaderItem") as IAttributeCell,
            ),
        );

    const dataValues = get<Execution.IExecutionResult, "data", Execution.DataValue[][]>(
        executionResult,
        "data",
        [],
    );

    const attributeRows = zip(...attributeValues);

    if (dataValues.length === 0) {
        return attributeRows;
    }
    if (isMatrix(dataValues)) {
        const measureValues: TableRow[] = dataValues;
        if (attributeRows.length === 0) {
            return measureValues;
        }

        return measureValues.map((measureValue: MeasureCell[], index: number) => {
            return [...attributeRows[index], ...measureValue];
        });
    }
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

function isResultTotalHeaderItem(
    headerItem: Execution.IResultHeaderItem,
): headerItem is Execution.IResultTotalHeaderItem {
    return (headerItem as Execution.ITotalHeaderItem).totalHeaderItem !== undefined;
}

function getOrderedTotalTypes(executionResult: Execution.IExecutionResult): string[] {
    // Totals are requested (and returned) in the same dimension as attributes, and in case of Table,
    // attributes are always in 0-th dimension right now, therefore executionResult.headerItems[0].
    // Also, we are now supporting only Grand Totals, so totals will be returned always next to the headerItems
    // of the first attribute, therefore executionResult.headerItems[0][0]
    const headerItems: Execution.IResultHeaderItem[] = get(executionResult, "headerItems[0][0]", []);

    return headerItems.reduce((types: string[], headerItem: Execution.IResultHeaderItem) => {
        if (isResultTotalHeaderItem(headerItem)) {
            types.push(headerItem.totalHeaderItem.type);
        }
        return types;
    }, []);
}

export function getTotalsWithData(
    totalsDefinition: IIndexedTotalItem[],
    executionResult: Execution.IExecutionResult,
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
            (total: IIndexedTotalItem) => total.type === type,
        );

        if (totalDefinition) {
            totals.push({
                ...totalDefinition,
                values: isEmpty(totalsResultValues) ? [] : totalsResultValues[index] || [],
            });
            index += 1;
        }

        return totals;
    }, []);
}

export function validateTableProportions(headers: IMappingHeader[], rows: TableRow[]): void {
    invariant(
        rows.length === 0 || headers.length === rows[0].length,
        "Number of table columns must be equal to number of table headers",
    );
}

export function getIntersectionForDrilling(
    afm: AFM.IAfm,
    header: IMappingHeader,
): IDrillEventIntersectionElement {
    if (isMappingHeaderAttribute(header)) {
        return createDrillIntersectionElement(
            getMappingHeaderIdentifier(header),
            getMappingHeaderName(header),
            getMappingHeaderUri(header),
            getMappingHeaderIdentifier(header),
        );
    }

    if (isMappingHeaderMeasureItem(header)) {
        const masterMeasureQualifier = getMasterMeasureObjQualifier(
            afm,
            getMappingHeaderLocalIdentifier(header),
        );
        const uri = masterMeasureQualifier.uri || getMappingHeaderUri(header);
        const identifier = masterMeasureQualifier.identifier || getMappingHeaderIdentifier(header);

        return createDrillIntersectionElement(
            getMappingHeaderLocalIdentifier(header),
            getMappingHeaderName(header),
            uri,
            identifier,
        );
    }

    throw new Error(`Unknown mapping header type ${Object.keys(header)}`);
}

export function getBackwardCompatibleRowForDrilling(row: TableRow): TableRowForDrilling {
    return row.map((cell: TableCell) => {
        return isAttributeCell(cell)
            ? {
                  id: getAttributeElementIdFromAttributeElementUri(cell.uri),
                  name: cell.name,
              }
            : cell;
    });
}
