// (C) 2022-2023 GoodData Corporation
import { IElementsQueryResult, CancelableOptions } from "@gooddata/sdk-backend-spi";
import { IAttributeElement, ObjRef } from "@gooddata/sdk-model";

import { ILoadElementsOptions } from "../../../types/index.js";
import { AttributeFilterHandlerStoreContext } from "../store/types.js";
import { IHiddenElementsInfo } from "./types.js";
import { loadElementsFromStaticElements } from "./loadElementsFromStaticElements.js";
import { loadElementsFromBackend } from "./loadElementsFromBackend.js";

/**
 * @internal
 */
export async function loadElements(
    context: AttributeFilterHandlerStoreContext,
    options: ILoadElementsOptions & CancelableOptions & { displayFormRef: ObjRef },
    hiddenElementsInfo: IHiddenElementsInfo,
    staticElements: IAttributeElement[] | undefined,
): Promise<IElementsQueryResult> {
    return staticElements?.length
        ? loadElementsFromStaticElements(options, hiddenElementsInfo, staticElements)
        : loadElementsFromBackend(context, options, hiddenElementsInfo);
}
