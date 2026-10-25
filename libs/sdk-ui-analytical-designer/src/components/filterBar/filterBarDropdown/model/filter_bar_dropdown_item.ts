// (C) 2020-2026 GoodData Corporation

export interface IFilterBarDropdownItem {
    id: string;
    title: string;
    filterLocalIdentifier: string;
    bucketItemLocalIdentifiers: ReadonlyArray<string>;
}
