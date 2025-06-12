// (C) 2021 GoodData Corporation

/**
 * @internal
 */
export interface IDateDataset {
    id: string;
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
