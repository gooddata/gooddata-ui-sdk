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
import invariant from "ts-invariant";
import flow from "lodash/flow";

import { IHiddenElementsInfo, ILoadAttributeElementsOptions } from "../types";

// inspired by the same thing in sdk-backend-base, copied here to avoid the dependency
class InMemoryPaging implements IElementsQueryResult {
    public readonly items: IAttributeElement[];
    public readonly limit: number;
    public readonly offset: number;
    public readonly totalCount: number;

    constructor(protected readonly allItems: IAttributeElement[], limit = 50, offset = 0) {
        invariant(offset >= 0, `paging offset must be non-negative, got: ${offset}`);
        invariant(limit > 0, `limit must be a positive number, got: ${limit}`);

        // this will naturally return empty items if at the end of data; limit will always be positive
        this.items = allItems.slice(offset, offset + limit);
        // offset is at most at the end of all available elements
        this.offset = Math.min(offset, allItems.length);
        // limit is always kept as-requested
        this.limit = limit;

        this.totalCount = allItems.length;
    }

    public async next(): Promise<IElementsQueryResult> {
        if (this.items.length === 0) {
            return this;
        }

        return new InMemoryPaging(this.allItems, this.limit, this.offset + this.items.length);
    }

    public async goTo(pageIndex: number): Promise<IElementsQueryResult> {
        if (this.items.length === 0) {
            return this;
        }

        return new InMemoryPaging(this.allItems, this.limit, pageIndex * this.items.length);
    }

    public async all(): Promise<IAttributeElement[]> {
        return [...this.allItems];
    }

    public async allSorted(
        compareFn: (a: IAttributeElement, b: IAttributeElement) => number,
    ): Promise<IAttributeElement[]> {
        return [...this.allItems].sort(compareFn);
    }
}

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
export async function loadAttributeElementsFromStaticElements(
    options: ILoadAttributeElementsOptions,
    hiddenElementsInfo: IHiddenElementsInfo,
    staticElements: IAttributeElement[],
): Promise<IElementsQueryResult> {
    invariant(
        !options.limitingAttributeFilters?.length,
        "Using limitingAttributeFilters is not supported when using static attribute elements",
    );
    invariant(
        !options.limitingDateFilters?.length,
        "Using limitingDateFilters is not supported when using static attribute elements",
    );
    invariant(
        !options.limitingMeasures?.length,
        "Using limitingMeasures is not supported when using static attribute elements",
    );

    const resolvedElements = flow(
        resolveHiddenElements(hiddenElementsInfo.hiddenElements),
        resolveSelectedElements(options.elements),
        resolveStringFilter(options.search),
    )(staticElements);

    return new InMemoryPaging(resolvedElements, options.limit, options.offset);
}
