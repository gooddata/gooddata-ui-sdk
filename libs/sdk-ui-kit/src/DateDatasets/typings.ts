// (C) 2021 GoodData Corporation

/**
 * @internal
 */
export interface IDateDataset {
    identifier: string;
    title: string;
    relevance?: number;
}

/**
 * @internal
 */
export interface IDateDatasetHeader {
    title: string;
    type: "header";
}
