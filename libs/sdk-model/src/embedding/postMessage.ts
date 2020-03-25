// (C) 2020 GoodData Corporation

/**
 * @public
 */
export interface ISimplePostMessageData {
    /**
     * URI of attribute or measure that should be drillable.
     */
    uris?: string[];

    /**
     * Identifier of attribute or measure that should be drillable.
     */
    identifiers?: string[];
}

/**
 * @public
 */
export interface IPostMessageData extends ISimplePostMessageData {
    /**
     * Optionally specifies drilling on measures that are composed from other measures - by listing uris or
     * identifiers of components.
     */
    composedFrom?: ISimplePostMessageData;
}

/**
 * @public
 */
export function isPostMessageData(item: any): item is IPostMessageData {
    return (item as IPostMessageData).composedFrom !== undefined;
}
