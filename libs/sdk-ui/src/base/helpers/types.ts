// (C) 2019 GoodData Corporation
import { IAttributeDescriptor, IResultAttributeHeader } from "@gooddata/sdk-backend-spi";

// TODO: get rid of this
export type IUnwrappedAttributeHeadersWithItems = IAttributeDescriptor["attributeHeader"] & {
    items: IResultAttributeHeader[];
};
