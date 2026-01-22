// (C) 2022-2026 GoodData Corporation

import { type CancelableOptions, type IElementsQueryResult } from "@gooddata/sdk-backend-spi";
import { type IAttributeElement, type ObjRef } from "@gooddata/sdk-model";

import { loadElementsFromBackend } from "./loadElementsFromBackend.js";
import { loadElementsFromStaticElements } from "./loadElementsFromStaticElements.js";
import { type IHiddenElementsInfo } from "./types.js";
import { type ILoadElementsOptions } from "../../../types/elementsLoader.js";
import { type IAttributeFilterHandlerStoreContext } from "../store/types.js";

/**
 * @internal
 */
export async function loadElements(
    context: IAttributeFilterHandlerStoreContext,
    options: ILoadElementsOptions & CancelableOptions & { displayFormRef: ObjRef },
    hiddenElementsInfo: IHiddenElementsInfo,
    staticElements: IAttributeElement[] | undefined,
    cacheId?: string,
): Promise<IElementsQueryResult> {
    return staticElements?.length
        ? loadElementsFromStaticElements(options, hiddenElementsInfo, staticElements)
        : loadElementsFromBackend(context, options, hiddenElementsInfo, cacheId);
}
