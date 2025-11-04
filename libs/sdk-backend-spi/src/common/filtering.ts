// (C) 2025 GoodData Corporation

/**
 * @beta
 */
export interface IFilterBaseOptions {
    /**
     * Resource contains the search string in any of several properties (case insensitive logical OR).
     * @beta
     */
    search?: string;

    /**
     * Resource id (case sensitive).
     * @beta
     */
    id?: string[];
    /**
     * Resource id to exclude (case sensitive).
     * @beta
     */
    excludeId?: string[];
    /**
     * Resource contains title (case insensitive).
     * @beta
     */
    title?: string;
    /**
     * Resource was created by user (case sensitive).
     * @beta
     */
    createdBy?: string[];
    /**
     * Resource was not created by user (case sensitive).
     * @beta
     */
    excludeCreatedBy?: string[];
    /**
     * Resource contains tags (case sensitive).
     * @beta
     */
    tags?: string[];
    /**
     * Resource does not contain tags (case sensitive).
     * @beta
     */
    excludeTags?: string[];
    /**
     * Resource is hidden.
     * @beta
     */
    isHidden?: boolean;
}
