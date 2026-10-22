// (C) 2025-2026 GoodData Corporation

import { type IDataView } from "@gooddata/sdk-backend-spi";
import { type ISeparators } from "@gooddata/sdk-model";
import {
    DataViewFacade,
    type ITableData,
    createNumberFormatter,
    formatAttributeHeaderValues,
} from "@gooddata/sdk-ui";

/**
 * Data views with formatted attribute element values, by the data view they were made from, together with
 * the separators they were formatted with. Reusing the formatted view reuses its facade together with the
 * table data the facade caches.
 */
const formattedDataViews = new WeakMap<IDataView, { separatorsKey: string; dataView: IDataView }>();

function separatorsKey(separators: ISeparators | undefined): string {
    return JSON.stringify([separators?.thousand, separators?.decimal]);
}

/**
 * Returns table data from a DataViewFacade with consistent value formatting.
 *
 * @remarks
 * This ensures all access to table data uses the same formatter without HTML escaping.
 * The DataViewFacade caches dataAccessMethods, so all calls must use the same formatter.
 *
 * Element values of attributes with a number format (numeric computed attributes) are formatted with the
 * same formatter before the table data is built. This happens once per data view and separators; later
 * calls for the same data view with the same separators return the cached table data.
 *
 * @param dataView - The data view facade
 * @param separators - Number separators to use for formatting
 * @internal
 */
export function getTableData(dataView: DataViewFacade, separators?: ISeparators): ITableData {
    const valueFormatter = createNumberFormatter(separators);
    const sourceDataView = dataView.dataView;
    const key = separatorsKey(separators);
    let cached = formattedDataViews.get(sourceDataView);

    if (cached?.separatorsKey !== key) {
        cached = {
            separatorsKey: key,
            dataView: formatAttributeHeaderValues(sourceDataView, valueFormatter),
        };
        formattedDataViews.set(sourceDataView, cached);
    }

    return DataViewFacade.for(cached.dataView).data({ valueFormatter }).asTable();
}
