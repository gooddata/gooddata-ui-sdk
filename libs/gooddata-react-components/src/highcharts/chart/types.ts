// (C) 2019 GoodData Corporation
import { Execution } from "@gooddata/typings";

export type IUnwrappedAttributeHeadersWithItems = Execution.IAttributeHeader["attributeHeader"] & {
    items: Execution.IResultAttributeHeaderItem[];
};
