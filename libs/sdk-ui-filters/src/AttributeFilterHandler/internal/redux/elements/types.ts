// (C) 2022 GoodData Corporation
import { type IAttributeElements, type IAttributeMetadataObject } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IHiddenElementsInfo {
    hiddenElements: IAttributeElements;
    attribute: IAttributeMetadataObject;
}
