// (C) 2019 GoodData Corporation

/**
 * @public
 */
export interface IBearPaging {
    offset: number;
    count: number;
    limit: number;
}

/**
 * @public
 */
export interface IBearPagingWithTotalCount extends IBearPaging {
    totalCount: number;
}
