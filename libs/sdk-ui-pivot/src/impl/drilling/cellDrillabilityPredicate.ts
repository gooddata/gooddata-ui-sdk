// (C) 2021-2025 GoodData Corporation
import {
    DataViewFacade,
    IHeaderPredicate,
    IMappingHeader,
    isSomeHeaderPredicateMatched,
} from "@gooddata/sdk-ui";

import { createDrillHeaders } from "./colDrillHeadersFactory.js";
import { ColumnHeadersPosition } from "../../publicTypes.js";
import { IGridRow } from "../data/resultTypes.js";
import { AnyCol } from "../structure/tableDescriptorTypes.js";

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
