// (C) 2019 GoodData Corporation

/**
 * Objects  related to paged server API's.
 *
 * @public
 */
export namespace GdcPaging {
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
}
