// (C) 2022 GoodData Corporation
import { IElementsQueryResult } from "@gooddata/sdk-backend-spi";
import { IAttributeElement, ObjRef } from "@gooddata/sdk-model";

import { ILoadElementsOptions } from "../../../types";
import { AttributeFilterHandlerStoreContext } from "../store/types";
import { IHiddenElementsInfo } from "./types";
import { loadElementsFromStaticElements } from "./loadElementsFromStaticElements";
import { loadElementsFromBackend } from "./loadElementsFromBackend";

/**
 * @internal
 */
export async function loadElements(
    context: AttributeFilterHandlerStoreContext,
    options: ILoadElementsOptions & { displayFormRef: ObjRef },
    hiddenElementsInfo: IHiddenElementsInfo,
    staticElements: IAttributeElement[] | undefined,
): Promise<IElementsQueryResult> {
    return staticElements?.length
        ? loadElementsFromStaticElements(options, hiddenElementsInfo, staticElements)
        : loadElementsFromBackend(context, options, hiddenElementsInfo);
}
