// (C) 2020-2026 GoodData Corporation

export interface IHighlightingState {
    highlightedBucketItems: string[] | undefined;
    highlightedFilterItem: string | undefined;
    aboutToBeRemovedBucketAndFilterItems: string[] | undefined;
}

export const highlightingInitialState: IHighlightingState = {
    highlightedBucketItems: undefined,
    highlightedFilterItem: undefined,
    aboutToBeRemovedBucketAndFilterItems: undefined,
};
