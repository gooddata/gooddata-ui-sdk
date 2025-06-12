// (C) 2022 GoodData Corporation
import {
    ElementsQueryOptionsElementsSpecification,
    IElementsQueryResult,
    isElementsQueryOptionsElementsByPrimaryDisplayFormValue,
    isElementsQueryOptionsElementsByValue,
    NotImplemented,
} from "@gooddata/sdk-backend-spi";
import {
    attributeElementsIsEmpty,
    IAttributeElement,
    IAttributeElements,
    isAttributeElementsByRef,
} from "@gooddata/sdk-model";
import flow from "lodash/flow.js";

import { ILoadElementsOptions } from "../../../types/index.js";
import { InMemoryPaging } from "./InMemoryPaging.js";
import { IHiddenElementsInfo } from "./types.js";

const resolveHiddenElements =
    (hiddenElements: IAttributeElements) =>
    (staticElements: IAttributeElement[]): IAttributeElement[] => {
        if (attributeElementsIsEmpty(hiddenElements)) {
            return staticElements;
        }

        return isAttributeElementsByRef(hiddenElements)
            ? staticElements.filter((item) => !hiddenElements.uris.includes(item.uri))
            : staticElements.filter((item) => !hiddenElements.values.includes(item.title));
    };

const resolveSelectedElements =
    (selectedElements: ElementsQueryOptionsElementsSpecification | undefined) =>
    (staticElements: IAttributeElement[]): IAttributeElement[] => {
        if (!selectedElements) {
            return staticElements;
        }

        if (isElementsQueryOptionsElementsByPrimaryDisplayFormValue(selectedElements)) {
            throw new NotImplemented("Elements by primary display form value are not supported yet");
        }

        return isElementsQueryOptionsElementsByValue(selectedElements)
            ? staticElements.filter((element) => selectedElements.values.includes(element.title))
            : staticElements.filter((element) => selectedElements.uris.includes(element.uri));
    };

const resolveStringFilter =
    (filter: string | undefined) =>
    (staticElements: IAttributeElement[]): IAttributeElement[] => {
        return filter
            ? staticElements.filter((item) => item.title.toLowerCase().includes(filter.toLowerCase()))
            : staticElements;
    };

/**
 * @internal
 */
export async function loadElementsFromStaticElements(
    options: ILoadElementsOptions,
    hiddenElementsInfo: IHiddenElementsInfo,
    staticElements: IAttributeElement[],
): Promise<IElementsQueryResult> {
    let resolvedElements = flow(
        resolveHiddenElements(hiddenElementsInfo.hiddenElements),
        resolveSelectedElements(options.elements),
        resolveStringFilter(options.search),
    )(staticElements);

    if (options.order === "desc") {
        resolvedElements = [...resolvedElements].reverse();
    }

    return new InMemoryPaging(resolvedElements, options.limit, options.offset);
}
