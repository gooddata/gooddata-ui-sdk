// (C) 2007-2026 GoodData Corporation

import { type ComponentType } from "react";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type IAttributeElement, type ObjRef } from "@gooddata/sdk-model";
import {
    type AttributeFilterAvailableSelectionType,
    type IAttributeFilterDropdownBodyProps,
    type IAttributeFilterDropdownButtonProps,
    type IAttributeFilterElementsSearchBarProps,
} from "@gooddata/sdk-ui-filters";

import { type IDecoratedMetricAttributeFilter } from "../../models/decorated_metric_attribute_filter.js";
import { type IUpdateAttributeFilterPayload } from "../../typings/measure_filters.js";
import { type ICacheItemDisplayForm } from "../../typings/state_objects.js";

export type OnDisplayFormChangeHandler = (
    dfRef: ObjRef,
    currentFilterPrimaryDf?: ObjRef,
    selectedElements?: IAttributeElement[],
) => void;
export interface IAttributeFilterProps {
    filter: IDecoratedMetricAttributeFilter;
    autoOpen?: boolean;

    onApply: (payload: IUpdateAttributeFilterPayload) => void;
    onClose?: () => void;

    bucketType: string;
    isUsedByInsight?: boolean;

    useAlternativeDisplayForms?: boolean;
    onDisplayFormChange: OnDisplayFormChangeHandler;
    availableDisplayForms: ICacheItemDisplayForm[];

    availableSelectionTypes?: AttributeFilterAvailableSelectionType[];
    dropdownClassName?: string;

    dropdownButtonComponent?: ComponentType<IAttributeFilterDropdownButtonProps>;
    dropdownBodyComponent?: ComponentType<IAttributeFilterDropdownBodyProps>;
    elementsSearchBarComponent?: ComponentType<IAttributeFilterElementsSearchBarProps>;
}

export interface IAttributeFilterStateProps {
    settings: IUserWorkspaceSettings;
}

export type IItemTitlesMap = {
    [index: string]: IAttributeElement;
};

export interface ISelectedElements {
    itemTitles: IItemTitlesMap;
    totalElementsCount: number;
}
