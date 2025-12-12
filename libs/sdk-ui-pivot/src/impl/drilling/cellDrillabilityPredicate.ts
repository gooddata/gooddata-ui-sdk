// (C) 2021-2025 GoodData Corporation
import {
    type DataViewFacade,
    type IHeaderPredicate,
    type IMappingHeader,
    isSomeHeaderPredicateMatched,
} from "@gooddata/sdk-ui";

import { createDrillHeaders } from "./colDrillHeadersFactory.js";
import { type ColumnHeadersPosition } from "../../publicTypes.js";
import { type IGridRow } from "../data/resultTypes.js";
import { type AnyCol } from "../structure/tableDescriptorTypes.js";

export function isCellDrillable(
    colDescriptor: AnyCol,
    row: IGridRow,
    dv: DataViewFacade,
    drillablePredicates: IHeaderPredicate[],
    columnHeadersPosition: ColumnHeadersPosition,
    isTransposed: boolean,
): boolean {
    if (drillablePredicates.length === 0 || colDescriptor.type === "mixedHeadersCol") {
        return false;
    }
    const headers: IMappingHeader[] = createDrillHeaders(
        colDescriptor,
        row,
        columnHeadersPosition,
        isTransposed,
    );

    return headers.some((drillItem: IMappingHeader) =>
        isSomeHeaderPredicateMatched(drillablePredicates, drillItem, dv),
    );
}
