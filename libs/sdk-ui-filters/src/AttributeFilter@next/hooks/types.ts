// (C) 2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IAttributeElement, IAttributeFilter, Identifier } from "@gooddata/sdk-model";

import { AttributeFiltersOrPlaceholders, IPlaceholder } from "@gooddata/sdk-ui";

import { OnApplyCallbackType, ParentFilterOverAttributeType } from "../types";

/**
 * @alpha
 */
export interface IUseAttributeFilterControllerProps {
    backend?: IAnalyticalBackend;
    workspace?: string;

    title?: string;
    filter?: IAttributeFilter;
    identifier?: Identifier;
    connectToPlaceholder?: IPlaceholder<IAttributeFilter>;
    parentFilters?: AttributeFiltersOrPlaceholders;
    parentFilterOverAttribute?: ParentFilterOverAttributeType;

    onApply?: OnApplyCallbackType;

    hiddenElements?: string[];
    staticElements?: IAttributeElement[];
}
