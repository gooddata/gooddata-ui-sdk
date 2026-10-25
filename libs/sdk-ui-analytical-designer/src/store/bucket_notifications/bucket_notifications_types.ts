// (C) 2020-2026 GoodData Corporation

export interface IRemovedItems {
    measures: number;
    measureValueFilters: number;
    rankingFilter: boolean;
}

export interface IItemsWithChangedGranularity {
    measureValueFilters: number;
}

export interface IBucketNotificationsState {
    removedItems: IRemovedItems | undefined;
    removedItemsWereJustUpdated: boolean | undefined;
    itemsWithChangedGranularity: IItemsWithChangedGranularity | undefined;
}
