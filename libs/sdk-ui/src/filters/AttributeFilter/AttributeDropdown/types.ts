// (C) 2019 GoodData Corporation
import { IPagedResource } from "@gooddata/sdk-backend-spi";
import { IAttributeElement } from "@gooddata/sdk-model";

export const emptyListItem = { empty: true };
export type EmptyListItem = typeof emptyListItem;
export type AttributeListItem = IAttributeElement | EmptyListItem;

export type IElementQueryResultWithEmptyItems = IPagedResource<AttributeListItem>;
