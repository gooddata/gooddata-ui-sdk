// (C) 2021 GoodData Corporation
import {
    DataViewFacade,
    IHeaderPredicate,
    IMappingHeader,
    isSomeHeaderPredicateMatched,
} from "@gooddata/sdk-ui";
import { IGridRow } from "../data/resultTypes.js";
import { createDrillHeaders } from "./colDrillHeadersFactory.js";
import { AnyCol } from "../structure/tableDescriptorTypes.js";
import { ColumnHeadersPosition } from "../../publicTypes.js";

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
