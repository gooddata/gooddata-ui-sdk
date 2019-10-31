// (C) 2007-2018 GoodData Corporation
import {
    IAttributeDescriptor,
    ITotalDescriptor,
    IMeasureDescriptor,
    IResultAttributeHeader,
} from "@gooddata/sdk-backend-spi";

/**
 * TODO: SDK8: remove this, replace with something more meaningful
 * @public
 */
export type IMappingHeader =
    | IAttributeDescriptor
    | IResultAttributeHeader
    | IMeasureDescriptor
    | ITotalDescriptor;
