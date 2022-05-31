// (C) 2019-2022 GoodData Corporation
import { IPagedResource } from "@gooddata/sdk-backend-spi";
import { IAttributeElement } from "@gooddata/sdk-model";

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
export type AttributeListItem = IAttributeElement | EmptyListItem;

/**
 * @internal
 */
export const isEmptyListItem = (item: unknown): item is EmptyListItem =>
    item && (item as EmptyListItem).empty;

/**
 * @internal
 */
export const isNonEmptyListItem = (item: unknown): item is IAttributeElement =>
    item && !(item as EmptyListItem).empty;

export type IElementQueryResultWithEmptyItems = IPagedResource<AttributeListItem>;
