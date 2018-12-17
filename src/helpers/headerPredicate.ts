// (C) 2007-2018 GoodData Corporation
import { AFM } from '@gooddata/typings';
import { identifierMatch, uriMatch } from '../factory/HeaderPredicateFactory';
import { IDrillableItem, isDrillableItemIdentifier, isDrillableItemUri } from '../interfaces/DrillEvents';
import { IHeaderPredicate, isHeaderPredicate } from '../interfaces/HeaderPredicate';
import { IMappingHeader } from '../interfaces/MappingHeader';

export function isSomeHeaderPredicateMatched(
    drillablePredicates: IHeaderPredicate[],
    header: IMappingHeader,
    afm: AFM.IAfm
): boolean {
    return drillablePredicates.some((drillablePredicate: IHeaderPredicate) => drillablePredicate(header, afm));
}

export function convertDrillableItemsToPredicates(
    drillableItems: Array<IDrillableItem | IHeaderPredicate>
): IHeaderPredicate[] {
    return drillableItems.reduce((acc: IHeaderPredicate[], drillableItem: IDrillableItem) => {
        if (isDrillableItemUri(drillableItem) && isDrillableItemIdentifier(drillableItem)) {
            return acc.concat([uriMatch(drillableItem.uri), identifierMatch(drillableItem.identifier)]);
        } else if (isDrillableItemUri(drillableItem)) {
            return acc.concat(uriMatch(drillableItem.uri));
        } else if (isDrillableItemIdentifier(drillableItem)) {
            return acc.concat(identifierMatch(drillableItem.identifier));
        } else if (isHeaderPredicate(drillableItem)) {
            return acc.concat(drillableItem);
        }
        return acc;
    }, []);
}
