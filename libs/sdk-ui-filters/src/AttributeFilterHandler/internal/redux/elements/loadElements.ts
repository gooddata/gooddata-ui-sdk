// (C) 2022-2025 GoodData Corporation
import { CancelableOptions, IElementsQueryResult } from "@gooddata/sdk-backend-spi";
import { IAttributeElement, ObjRef } from "@gooddata/sdk-model";

import { loadElementsFromBackend } from "./loadElementsFromBackend.js";
import { loadElementsFromStaticElements } from "./loadElementsFromStaticElements.js";
import { IHiddenElementsInfo } from "./types.js";
import { ILoadElementsOptions } from "../../../types/index.js";
import { AttributeFilterHandlerStoreContext } from "../store/types.js";

/**
 * @internal
 */
export async function loadElements(
    context: AttributeFilterHandlerStoreContext,
    options: ILoadElementsOptions & CancelableOptions & { displayFormRef: ObjRef },
    hiddenElementsInfo: IHiddenElementsInfo,
    staticElements: IAttributeElement[] | undefined,
    cacheId?: string,
): Promise<IElementsQueryResult> {
    return staticElements?.length
        ? loadElementsFromStaticElements(options, hiddenElementsInfo, staticElements)
        : loadElementsFromBackend(context, options, hiddenElementsInfo, cacheId);
}
