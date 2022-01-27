// (C) 2021 GoodData Corporation
import { TableDescriptor } from "../structure/tableDescriptor";
import { DataValue } from "@gooddata/sdk-backend-spi";
import { getMappingHeaderUri } from "@gooddata/sdk-ui";
import { invariant } from "ts-invariant";
import { IGridRow } from "../data/resultTypes";

/**
 * @deprecated this is linked to deprecated API
 */
function extractIdsFromAttributeElementUri(uri: string): (string | null)[] {
    const [, attributeId, , attributeValueId = null] = uri.match(/obj\/([^/]*)(\/elements\?id=)?(.*)?$/)!;

    return [attributeId, attributeValueId];
}

export type DrilledSliceDetail = {
    /**
     * Identifier of the attribute element for this slice.
     *
     * NOTE:
     *
     * @deprecated use URI instead; ID does not hold full information about the attribute element
     */
    id: string;

    /**
     * This is an URI exactly identifying attribute element. It is essentially a primary key of the
     * attribute element.
     */
    uri: string;

    /**
     * Name of the attribute element.
     */
    name: string;
};

export type DrilledRow = Array<DrilledSliceDetail | DataValue>;

/**
 * Given row in an ag-grid table and the table's descriptor, this function will create a drilled row. Drilled
 * row is an array with cols ordered in the same way as they appear in the table. The information about slice
 * columns appear first, followed by values of data columns.
 *
 * The the information about slice column contains both
 */
export function createDrilledRow(row: IGridRow, tableDescriptor: TableDescriptor): DrilledRow {
    const result: DrilledRow = [];

    tableDescriptor.headers.sliceCols.forEach((col) => {
        const mappingHeader = row.headerItemMap[col.id];
        // if there is no entry for slice column in the row's headerItemMap, then the construction of
        // row data is hosed or table code allowed to click on something that should not be drillable
        invariant(mappingHeader);

        const drillItemUri = getMappingHeaderUri(mappingHeader);

        // if there is no drill item uri, then it means that either headerItemMap does not contain valid item or
        // the pivot table allowed click&drill on something that should not be drillable
        invariant(drillItemUri);

        const maybeId = drillItemUri.startsWith("/gdc")
            ? extractIdsFromAttributeElementUri(drillItemUri)[1]
            : null;

        result.push({
            // Note: this is related to `id` deprecation. The whole `id` thing does not make sense. Code should
            // send the entire URI (== PK of the element) so that the code is backend-agnostic. Doing the check
            // here so that for bear, drill contains the `id` and for other backends code adds the entire uri (PK).
            // with this in place, we don't have to worry about how other backends represent the PK of the element.
            id: maybeId ?? drillItemUri,
            uri: drillItemUri,
            name: row[col.id],
        });
    });

    tableDescriptor.headers.leafDataCols.forEach((col) => {
        result.push(row[col.id]);
    });

    return result;
}
