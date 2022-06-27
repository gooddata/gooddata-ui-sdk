// (C) 2022 GoodData Corporation
import {
    ElementsQueryOptionsElementsSpecification,
    IElementsQueryAttributeFilter,
} from "@gooddata/sdk-backend-spi";
import {
    IAttributeElements,
    IAttributeMetadataObject,
    IMeasure,
    IRelativeDateFilter,
    ObjRef,
} from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface ILoadAttributeElementsOptions {
    displayFormRef: ObjRef;
    offset?: number;
    limit?: number;
    search?: string;
    limitingAttributeFilters?: IElementsQueryAttributeFilter[];
    limitingMeasures?: IMeasure[];
    limitingDateFilters?: IRelativeDateFilter[];
    elements?: ElementsQueryOptionsElementsSpecification;
}

/**
 * @internal
 */
export interface IHiddenElementsInfo {
    hiddenElements: IAttributeElements;
    attribute: IAttributeMetadataObject;
}
