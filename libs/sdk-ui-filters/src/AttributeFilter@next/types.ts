// (C) 2019-2022 GoodData Corporation
import { IPagedResource } from "@gooddata/sdk-backend-spi";

export const emptyListItem: EmptyListItem = { empty: true };

/**
 * @internal
 */
export interface EmptyListItem {
    empty: true;
}

/**
 * @internal
 */
export interface IListItem {
    title: string;
    uri: string; //TODO rename to key and check mappings
}

/**
 * @internal
 */
export type AttributeListItem = IListItem | EmptyListItem;

/**
 * @internal
 */
export const isEmptyListItem = (item: unknown): item is EmptyListItem =>
    item && (item as EmptyListItem).empty;

/**
 * @internal
 */
export const isNonEmptyListItem = (item: unknown): item is IListItem =>
    item && !(item as EmptyListItem).empty;

export type IElementQueryResultWithEmptyItems = IPagedResource<AttributeListItem>;
