// (C) 2019-2022 GoodData Corporation
import { IAttributeDescriptor, IResultAttributeHeader } from "@gooddata/sdk-model";

// TODO: get rid of this
export type IUnwrappedAttributeHeadersWithItems = IAttributeDescriptor["attributeHeader"] & {
    items: IResultAttributeHeader[];
};

// LEGEND POSITION TYPES.
// TODO: get rid of these. replace with types in ui-vis-commons where legend is defined
export const LEFT = "left";
export const RIGHT = "right";
export const TOP = "top";
export const BOTTOM = "bottom";
export const AUTO = "auto";
