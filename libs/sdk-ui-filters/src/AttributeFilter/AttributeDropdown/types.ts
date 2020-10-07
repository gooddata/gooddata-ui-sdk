// (C) 2019-2020 GoodData Corporation
import { IPagedResource, IAttributeElement } from "@gooddata/sdk-backend-spi";

export const emptyListItem = { empty: true };
export type EmptyListItem = typeof emptyListItem;
export type AttributeListItem = IAttributeElement | EmptyListItem;

export const isNonEmptyListItem = (item: Partial<AttributeListItem>): item is IAttributeElement =>
    item && !(item as EmptyListItem).empty;

export type IElementQueryResultWithEmptyItems = IPagedResource<AttributeListItem>;
