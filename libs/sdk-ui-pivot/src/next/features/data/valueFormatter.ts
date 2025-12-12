// (C) 2025 GoodData Corporation

import { ClientFormatterFacade, type IFormattedResult } from "@gooddata/number-formatter";
import { type DataValue, type ISeparators } from "@gooddata/sdk-model";
import { type DataViewFacade, type ITableData, type ValueFormatter } from "@gooddata/sdk-ui";

/**
 * Formats a number value using the number-formatter.
 */
function getFormattedNumber(value: DataValue, format?: string, separators?: ISeparators): IFormattedResult {
    const parsedNumber = ClientFormatterFacade.convertValue(value);
    return ClientFormatterFacade.formatValue(parsedNumber, format, separators);
}

/**
 * Creates a value formatter that formats measure values without HTML escaping.
 *
 * @remarks
 * This mirrors the old pivot table behavior.
 *
 * @param separators - number separators to use
 */
function createValueFormatter(separators?: ISeparators): ValueFormatter {
    return (value: DataValue, format: string) => {
        const { formattedValue } = getFormattedNumber(value, format, separators);
        return formattedValue;
    };
}

/**
 * Returns table data from a DataViewFacade with consistent value formatting.
 *
 * @remarks
 * This ensures all access to table data uses the same formatter without HTML escaping.
 * The DataViewFacade caches dataAccessMethods, so all calls must use the same formatter.
 *
 * @param dataView - The data view facade
 * @param separators - Number separators to use for formatting
 * @internal
 */
export function getTableData(dataView: DataViewFacade, separators?: ISeparators): ITableData {
    return dataView.data({ valueFormatter: createValueFormatter(separators) }).asTable();
}
