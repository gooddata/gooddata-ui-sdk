// (C) 2020-2026 GoodData Corporation

export interface IItemState {
    enabled: boolean;
    filterLocalIdentifier: string;
    bucketItemLocalIdentifiers: ReadonlyArray<string>;
}

export interface IItemsState {
    [id: string]: IItemState;
}
