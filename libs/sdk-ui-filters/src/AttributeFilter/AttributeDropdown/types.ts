// (C) 2019-2022 GoodData Corporation
import { IPagedResource } from "@gooddata/sdk-backend-spi";
import { IAttributeElement } from "@gooddata/sdk-model";

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
