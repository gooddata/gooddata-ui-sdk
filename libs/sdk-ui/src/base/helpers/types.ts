// (C) 2019 GoodData Corporation
import { IAttributeHeader, IResultAttributeHeaderItem } from "@gooddata/sdk-backend-spi";

export type IUnwrappedAttributeHeadersWithItems = IAttributeHeader["attributeHeader"] & {
    items: IResultAttributeHeaderItem[];
};
