// (C) 2007-2018 GoodData Corporation
import { DataViewFacade } from "@gooddata/sdk-backend-spi";
import { identifierMatch, uriMatch } from "../factory/HeaderPredicateFactory";
import { IDrillableItem, isDrillableItemIdentifier, isDrillableItemUri } from "../interfaces/DrillEvents";
import { IHeaderPredicate2, isHeaderPredicate } from "../interfaces/HeaderPredicate";
import { IMappingHeader } from "../interfaces/MappingHeader";

export function isSomeHeaderPredicateMatched2(
    drillablePredicates: IHeaderPredicate2[],
    header: IMappingHeader,
    dv: DataViewFacade,
): boolean {
    return drillablePredicates.some((drillablePredicate: IHeaderPredicate2) =>
        drillablePredicate(header, { dv }),
    );
}

export function convertDrillableItemsToPredicates2(
    drillableItems: Array<IDrillableItem | IHeaderPredicate2>,
): IHeaderPredicate2[] {
    return drillableItems.map((drillableItem: IDrillableItem) => {
        if (isDrillableItemUri(drillableItem)) {
            return uriMatch(drillableItem.uri);
        } else if (isDrillableItemIdentifier(drillableItem)) {
            return identifierMatch(drillableItem.identifier);
        } else if (isHeaderPredicate(drillableItem)) {
            return drillableItem;
        }
    });
}
