// (C) 2007-2018 GoodData Corporation
import { Execution } from "@gooddata/typings";

export type IMappingHeader =
    | Execution.IAttributeHeader
    | Execution.IResultAttributeHeaderItem
    | Execution.IMeasureHeaderItem
    | Execution.ITotalHeaderItem;

export function isMappingHeaderMeasureItem(header: IMappingHeader): header is Execution.IMeasureHeaderItem {
    return (header as Execution.IMeasureHeaderItem).measureHeaderItem !== undefined;
}

export function isMappingHeaderAttribute(header: IMappingHeader): header is Execution.IAttributeHeader {
    return (header as Execution.IAttributeHeader).attributeHeader !== undefined;
}

export function isMappingHeaderAttributeItem(
    header: IMappingHeader,
): header is Execution.IResultAttributeHeaderItem {
    return (header as Execution.IResultAttributeHeaderItem).attributeHeaderItem !== undefined;
}

export function isMappingHeaderTotal(header: IMappingHeader): header is Execution.ITotalHeaderItem {
    return (header as Execution.ITotalHeaderItem).totalHeaderItem !== undefined;
}
