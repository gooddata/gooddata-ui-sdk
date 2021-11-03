// (C) 2019-2021 GoodData Corporation
import { ElementsRequest, ElementsRequestSortOrderEnum } from "@gooddata/api-client-tiger";
import { enhanceWithAll, InMemoryPaging } from "@gooddata/sdk-backend-base";
import {
    IElementsQueryFactory,
    IElementsQuery,
    IElementsQueryOptions,
    IElementsQueryResult,
    UnexpectedError,
    NotSupported,
    IAttributeElement,
    FilterWithResolvableElements,
    IFilterElementsQuery,
} from "@gooddata/sdk-backend-spi";
import {
    ObjRef,
    isIdentifierRef,
    IAttributeFilter,
    IRelativeDateFilter,
    isAttributeFilter,
    filterAttributeElements,
    isAttributeElementsByRef,
} from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import { TigerAuthenticatedCallGuard } from "../../../../types";
import { getRelativeDateFilterShiftedValues } from "./date";

export class TigerWorkspaceElements implements IElementsQueryFactory {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public forDisplayForm(ref: ObjRef): IElementsQuery {
        return new TigerWorkspaceElementsQuery(this.authCall, ref, this.workspace);
    }
    public forFilter(filter: FilterWithResolvableElements): IFilterElementsQuery {
        return new TigerWorkspaceFilterElementsQuery(this.authCall, filter);
    }
}

class TigerWorkspaceElementsQuery implements IElementsQuery {
    private limit: number = 100;
    private offset: number = 0;
    private options: IElementsQueryOptions | undefined;

    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly ref: ObjRef,
        private readonly workspace: string,
    ) {}

    public withLimit(limit: number): IElementsQuery {
        invariant(limit > 0, `limit must be a positive number, got: ${limit}`);

        this.limit = limit;

        return this;
    }

    public withOffset(offset: number): IElementsQuery {
        this.offset = offset;
        return this;
    }

    public withAttributeFilters(): IElementsQuery {
        throw new NotSupported("not supported");
    }

    public withDateFilters(): IElementsQuery {
        throw new NotSupported("not supported");
    }

    public withMeasures(): IElementsQuery {
        throw new NotSupported("not supported");
    }

    public withOptions(options: IElementsQueryOptions): IElementsQuery {
        this.options = options;
        return this;
    }

    public async query(): Promise<IElementsQueryResult> {
        return this.queryWorker(this.offset, this.limit, this.options);
    }

    private async queryWorker(
        offset: number,
        limit: number,
        options: IElementsQueryOptions | undefined,
    ): Promise<IElementsQueryResult> {
        const { ref } = this;
        if (!isIdentifierRef(ref)) {
            throw new UnexpectedError("Tiger backend does not allow referencing objects by URI");
        }
        const response = await this.authCall((client) => {
            const elementsRequest: ElementsRequest = {
                label: ref.identifier,
                ...(options?.complement && { complementFilter: options.complement }),
                ...(options?.filter && { patternFilter: options.filter }),
                ...(options?.uris && { exactFilter: options.uris }),
                ...(options?.order && {
                    sortOrder:
                        options.order === "asc"
                            ? ElementsRequestSortOrderEnum.ASC
                            : ElementsRequestSortOrderEnum.DESC,
                }),
            };

            const elementsRequestWrapped: Parameters<
                typeof client.labelElements.computeLabelElementsPost
            >[0] = {
                limit,
                offset,
                elementsRequest,
                workspaceId: this.workspace,
            };

            return client.labelElements.computeLabelElementsPost(elementsRequestWrapped);
        });

        const { paging, elements } = response.data;
        const { count, total, offset: serverOffset } = paging;
        const hasNextPage = serverOffset + count < total;

        const goTo = (pageIndex: number) => {
            const hasRequestedPage = pageIndex * count < total;
            return hasRequestedPage
                ? this.queryWorker(pageIndex * count, limit, options)
                : Promise.resolve(emptyResult);
        };

        const emptyResult: IElementsQueryResult = enhanceWithAll({
            items: [],
            limit,
            offset,
            totalCount: 0,
            next: () => Promise.resolve(emptyResult),
            goTo,
        });

        return enhanceWithAll({
            items: elements.map(
                (element): IAttributeElement => ({
                    title: element.title,
                    uri: element.primaryTitle,
                }),
            ),
            limit: count,
            offset: serverOffset,
            totalCount: total,
            next: hasNextPage
                ? () => this.queryWorker(offset + count, limit, options)
                : () => Promise.resolve(emptyResult),
            goTo,
        });
    }
}

class TigerWorkspaceFilterElementsQuery implements IFilterElementsQuery {
    private limit: number = 100;
    private offset: number = 0;

    constructor(
        _authCall: TigerAuthenticatedCallGuard,
        private readonly filter: IAttributeFilter | IRelativeDateFilter,
    ) {}

    // eslint-disable-next-line sonarjs/no-identical-functions
    public withLimit(limit: number): IFilterElementsQuery {
        invariant(limit > 0, `limit must be a positive number, got: ${limit}`);

        this.limit = limit;

        return this;
    }

    public withOffset(offset: number): IFilterElementsQuery {
        this.offset = offset;
        return this;
    }

    public async query(): Promise<IElementsQueryResult> {
        if (isAttributeFilter(this.filter)) {
            return this.queryAttributeFilterElements();
        } else {
            return this.queryDateFilterElements();
        }
    }

    private async queryAttributeFilterElements(): Promise<IElementsQueryResult> {
        const selectedElements = filterAttributeElements(this.filter) || { values: [] };
        // Tiger supports only elements by value, but KD sends them in format of elementsByRef so we need to handle both formats in the same way
        const values = isAttributeElementsByRef(selectedElements)
            ? selectedElements.uris
            : selectedElements.values;

        const elements = values.map(
            (element): IAttributeElement => ({
                title: element,
                uri: element,
            }),
        );

        return Promise.resolve(new InMemoryPaging<IAttributeElement>(elements, this.limit, this.offset));
    }

    private async queryDateFilterElements(): Promise<IElementsQueryResult> {
        const relativeDateFilters = getRelativeDateFilterShiftedValues(new Date(), this.filter as any);

        const items: IAttributeElement[] = relativeDateFilters.map((relativeDateFilter: string) => ({
            title: relativeDateFilter,
            uri: relativeDateFilter,
        }));

        return Promise.resolve(new InMemoryPaging<IAttributeElement>(items, this.limit, this.offset));
    }
}
