// (C) 2007-2018 GoodData Corporation
import { AFM } from '@gooddata/typings';
import { IMappingHeader } from './MappingHeader';
import { IDrillableItem } from './DrillEvents';

export type IHeaderPredicate = (header: IMappingHeader, afm: AFM.IAfm) => boolean;

export function isHeaderPredicate(item: IDrillableItem | IHeaderPredicate): item is IHeaderPredicate {
    return typeof item === 'function';
}
