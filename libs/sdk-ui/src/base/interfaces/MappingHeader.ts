// (C) 2007-2018 GoodData Corporation
import {
    IAttributeHeader,
    ITotalHeaderItem,
    IMeasureHeaderItem,
    IResultAttributeHeaderItem,
} from "@gooddata/sdk-backend-spi";

/**
 * TODO: SDK8: remove this, replace with something more meaningful
 * @public
 */
export type IMappingHeader =
    | IAttributeHeader
    | IResultAttributeHeaderItem
    | IMeasureHeaderItem
    | ITotalHeaderItem;
