// (C) 2019 GoodData Corporation
import { Execution } from "@gooddata/gd-bear-model";

export type IUnwrappedAttributeHeadersWithItems = Execution.IAttributeHeader["attributeHeader"] & {
    items: Execution.IResultAttributeHeaderItem[];
};
