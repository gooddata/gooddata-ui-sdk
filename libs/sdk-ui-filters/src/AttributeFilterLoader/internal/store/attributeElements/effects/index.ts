// (C) 2022 GoodData Corporation
import { IElementsQueryResult } from "@gooddata/sdk-backend-spi";
import { IAttributeElement } from "@gooddata/sdk-model";

import { AttributeFilterStoreContext } from "../../types";
import { IHiddenElementsInfo, ILoadAttributeElementsOptions } from "../types";
import { loadAttributeElementsFromStaticElements } from "./loadAttributeElementsFromStaticElements";
import { loadAttributeElementsFromBackend } from "./loadAttributeElementsFromBackend";

/**
 * @internal
 */
export async function loadAttributeElements(
    context: AttributeFilterStoreContext,
    options: ILoadAttributeElementsOptions,
    hiddenElementsInfo: IHiddenElementsInfo,
    staticElements: IAttributeElement[] | undefined,
): Promise<IElementsQueryResult> {
    return staticElements?.length
        ? loadAttributeElementsFromStaticElements(options, hiddenElementsInfo, staticElements)
        : loadAttributeElementsFromBackend(context, options, hiddenElementsInfo);
}
