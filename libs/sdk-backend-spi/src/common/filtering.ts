// (C) 2025 GoodData Corporation

/**
 * @beta
 */
export interface IFilterBaseOptions {
    /**
     * Resource contains title case insensitive
     * @beta
     */
    title?: string;
    /**
     * Resource was created by user, case sensitive
     * @beta
     */
    createdBy?: string;
    /**
     * Resource contains tags, case sensitive
     * @beta
     */
    tags?: string[];
}
