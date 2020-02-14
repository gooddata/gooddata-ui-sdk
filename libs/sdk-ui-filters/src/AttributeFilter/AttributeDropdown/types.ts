// (C) 2019 GoodData Corporation
import { IPagedResource } from "@gooddata/sdk-backend-spi";
import { IAttributeElement } from "@gooddata/sdk-model";

export const emptyListItem = { empty: true };
export type EmptyListItem = typeof emptyListItem;
export type AttributeListItem = IAttributeElement | EmptyListItem;

export const isEmptyListItem = (item: Partial<AttributeListItem>): item is EmptyListItem =>
    item && (item as EmptyListItem).empty;

export const isNonEmptyListItem = (item: Partial<AttributeListItem>): item is IAttributeElement =>
    item && !(item as EmptyListItem).empty;

export type IElementQueryResultWithEmptyItems = IPagedResource<AttributeListItem>;
