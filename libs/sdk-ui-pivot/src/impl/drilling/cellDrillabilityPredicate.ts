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

export function isCellDrillable(
    colDescriptor: AnyCol,
    row: IGridRow,
    dv: DataViewFacade,
    drillablePredicates: IHeaderPredicate[],
): boolean {
    if (drillablePredicates.length === 0) {
        return false;
    }
    const headers: IMappingHeader[] = createDrillHeaders(colDescriptor, row);

    return headers.some((drillItem: IMappingHeader) =>
        isSomeHeaderPredicateMatched(drillablePredicates, drillItem, dv),
    );
}
