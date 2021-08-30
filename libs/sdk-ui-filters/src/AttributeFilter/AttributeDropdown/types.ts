// (C) 2019-2021 GoodData Corporation
import { IPagedResource, IAttributeElement } from "@gooddata/sdk-backend-spi";

export const emptyListItem: EmptyListItem = { empty: true };

/**
 * @public
 */
export interface EmptyListItem {
    empty: true;
}
/**
 * @public
 */
export type AttributeListItem = IAttributeElement | EmptyListItem;

/**
 * @public
 */
export const isEmptyListItem = (item: Partial<AttributeListItem>): item is EmptyListItem =>
    item && (item as EmptyListItem).empty;

/**
 * @public
 */
export const isNonEmptyListItem = (item: Partial<AttributeListItem>): item is IAttributeElement =>
    item && !(item as EmptyListItem).empty;

export type IElementQueryResultWithEmptyItems = IPagedResource<AttributeListItem>;
