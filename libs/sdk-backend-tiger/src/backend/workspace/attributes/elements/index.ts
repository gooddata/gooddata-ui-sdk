// (C) 2019-2022 GoodData Corporation
import {
    ElementsRequest,
    FilterByLabelTypeEnum,
    ElementsRequestSortOrderEnum,
} from "@gooddata/api-client-tiger";
import { InMemoryPaging, ServerPaging } from "@gooddata/sdk-backend-base";
import {
    FilterWithResolvableElements,
    IElementsQuery,
    IElementsQueryFactory,
    IElementsQueryOptions,
    IElementsQueryResult,
    IFilterElementsQuery,
    isElementsQueryOptionsElementsByValue,
    isValueBasedElementsQueryOptionsElements,
    NotSupported,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import {
    filterAttributeElements,
    IAttributeFilter,
    IRelativeDateFilter,
    isAttributeElementsByRef,
    isAttributeFilter,
    isIdentifierRef,
    ObjRef,
    IAttributeElement,
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
        return this.queryWorker(this.options);
    }

    private getExactFilterSpec(options: IElementsQueryOptions): Partial<ElementsRequest> {
        const { elements, uris } = options;
        if (elements) {
            if (uris) {
                // eslint-disable-next-line no-console
                console.warn(
                    "Both 'elements' and 'uris' used in IElementsQueryOptions, 'uris' property will be ignored.",
                );
            }

            invariant(
                isValueBasedElementsQueryOptionsElements(elements),
                "Specifying elements by URIs is not supported. Use specification by value instead.",
            );

            return isElementsQueryOptionsElementsByValue(elements)
                ? {
                      exactFilter: elements.values,
                      filterBy: {
                          labelType: FilterByLabelTypeEnum.REQUESTED,
                      },
                  }
                : {
                      exactFilter: elements.primaryValues,
                      filterBy: {
                          labelType: FilterByLabelTypeEnum.PRIMARY,
                      },
                  };
        } else if (uris) {
            return {
                exactFilter: uris,
                // filtering by uris on tiger forces filtering by primary label value
                // this is way how we load non-primary label by primary label values list in uris option (related to NAS-137)
                filterBy: {
                    labelType: FilterByLabelTypeEnum.PRIMARY,
                },
            };
        }

        return {};
    }

    private async queryWorker(options: IElementsQueryOptions | undefined): Promise<IElementsQueryResult> {
        const { ref } = this;
        if (!isIdentifierRef(ref)) {
            throw new UnexpectedError("Tiger backend does not allow referencing objects by URI");
        }

        return ServerPaging.for(
            async ({ offset, limit }) => {
                const response = await this.authCall((client) => {
                    const elementsRequest: ElementsRequest = {
                        label: ref.identifier,
                        ...(options?.complement && { complementFilter: options.complement }),
                        ...(options?.filter && { patternFilter: options.filter }),
                        ...this.getExactFilterSpec(options ?? {}),
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
                        limit: limit,
                        offset: offset,
                        elementsRequest,
                        workspaceId: this.workspace,
                    };

                    return client.labelElements.computeLabelElementsPost(elementsRequestWrapped);
                });

                const { paging, elements } = response.data;

                return {
                    items: elements.map(
                        (element): IAttributeElement => ({
                            title: element.title,
                            uri: element.primaryTitle,
                        }),
                    ),
                    totalCount: paging.total,
                };
            },
            this.limit,
            this.offset,
        );
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
