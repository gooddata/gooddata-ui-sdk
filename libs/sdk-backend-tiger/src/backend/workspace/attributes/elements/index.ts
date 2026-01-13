// (C) 2019-2026 GoodData Corporation

import { invariant } from "ts-invariant";

import {
    type DependsOn,
    type DependsOnDateFilter,
    type ElementsRequest,
    type ElementsResponseGranularityEnum,
} from "@gooddata/api-client-tiger";
import { ActionsApi_ComputeLabelElementsPost } from "@gooddata/api-client-tiger/endpoints/labelElements";
import { InMemoryPaging, ServerPaging } from "@gooddata/sdk-backend-base";
import {
    type FilterWithResolvableElements,
    type IElementsQuery,
    type IElementsQueryAttributeFilter,
    type IElementsQueryFactory,
    type IElementsQueryOptions,
    type IElementsQueryResult,
    type IFilterElementsQuery,
    NotSupported,
    UnexpectedError,
    isElementsQueryOptionsElementsByValue,
    isValueBasedElementsQueryOptionsElements,
} from "@gooddata/sdk-backend-spi";
import {
    type IAbsoluteDateFilter,
    type IAttributeElement,
    type IAttributeFilter,
    type IRelativeDateFilter,
    type ObjRef,
    filterAttributeElements,
    filterIsEmpty,
    filterObjRef,
    isAttributeElementsByRef,
    isAttributeFilter,
    isIdentifierRef,
    isNegativeAttributeFilter,
    objRefToString,
} from "@gooddata/sdk-model";

import { getRelativeDateFilterShiftedValues } from "./date.js";
import { mapDashboardDateFilterToDependentDateFilter } from "./dependentDateFilters.js";
import { TigerCancellationConverter } from "../../../../cancelation/index.js";
import { createDateValueFormatter } from "../../../../convertors/fromBackend/dateFormatting/dateValueFormatter.js";
import { createDateValueNormalizer } from "../../../../convertors/fromBackend/dateFormatting/dateValueNormalizer.js";
import { type FormattingLocale } from "../../../../convertors/fromBackend/dateFormatting/defaultDateFormatter.js";
import { type DateFormatter } from "../../../../convertors/fromBackend/dateFormatting/types.js";
import { toSdkGranularity } from "../../../../convertors/fromBackend/dateGranularityConversions.js";
import { toObjQualifier } from "../../../../convertors/toBackend/ObjRefConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../../types/index.js";

export class TigerWorkspaceElements implements IElementsQueryFactory {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
        private readonly dateFormatter: DateFormatter,
    ) {}

    public forDisplayForm(ref: ObjRef): IElementsQuery {
        return new TigerWorkspaceElementsQuery(this.authCall, ref, this.workspace, this.dateFormatter);
    }

    public forFilter(filter: FilterWithResolvableElements): IFilterElementsQuery {
        return new TigerWorkspaceFilterElementsQuery(this.authCall, filter);
    }
}

class TigerWorkspaceElementsQuery implements IElementsQuery {
    private limit: number = 100;
    private offset: number = 0;
    private signal: AbortSignal | null = null;
    private options: IElementsQueryOptions | undefined;
    private attributeFilters: IElementsQueryAttributeFilter[] | undefined;
    private dateFilters: (IRelativeDateFilter | IAbsoluteDateFilter)[] | undefined;
    private validateBy: ObjRef[] | undefined;

    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly ref: ObjRef,
        private readonly workspace: string,
        private readonly dateFormatter: DateFormatter,
    ) {}

    public withSignal(signal: AbortSignal): IElementsQuery {
        this.signal = signal;
        return this;
    }

    public withLimit(limit: number): IElementsQuery {
        invariant(limit > 0, `limit must be a positive number, got: ${limit}`);

        this.limit = limit;

        return this;
    }

    public withOffset(offset: number): IElementsQuery {
        this.offset = offset;
        return this;
    }

    public withAttributeFilters(filters: IElementsQueryAttributeFilter[]): IElementsQuery {
        this.attributeFilters = filters;
        return this;
    }

    public withDateFilters(filters: (IRelativeDateFilter | IAbsoluteDateFilter)[]): IElementsQuery {
        this.dateFilters = filters;
        return this;
    }

    public withMeasures(): IElementsQuery {
        throw new NotSupported(
            "withMeasures is not supported in sdk-backend-tiger yet. Use withAvailableElementsOnly instead.",
        );
    }

    public withAvailableElementsOnly(validateBy: ObjRef[]): IElementsQuery {
        this.validateBy = validateBy.length > 0 ? validateBy : undefined;
        return this;
    }

    public withOptions(options: IElementsQueryOptions): IElementsQuery {
        this.options = options;
        return this;
    }

    public async query(): Promise<IElementsQueryResult> {
        return this.queryWorker(this.options);
    }

    private getExactFilterSpec(options: IElementsQueryOptions): Partial<ElementsRequest> {
        const { elements } = options;
        if (elements) {
            invariant(
                isValueBasedElementsQueryOptionsElements(elements),
                "Specifying elements by URIs is not supported. Use specification by value instead.",
            );

            return isElementsQueryOptionsElementsByValue(elements)
                ? {
                      exactFilter: elements.values as string[],
                      filterBy: {
                          labelType: "REQUESTED",
                      },
                  }
                : {
                      exactFilter: elements.primaryValues as string[],
                      filterBy: {
                          labelType: "PRIMARY",
                      },
                  };
        }

        return {};
    }

    private getDependsOnSpec(): Partial<ElementsRequest> {
        const { attributeFilters, dateFilters } = this;

        let result: Array<DependsOn | DependsOnDateFilter> = [];
        if (attributeFilters) {
            const dependsOn = attributeFilters
                // Do not include empty parent filters
                .filter((filter) => !filterIsEmpty(filter.attributeFilter))
                .map((filter) => {
                    const { attributeFilter } = filter;
                    const complementFilter = isNegativeAttributeFilter(attributeFilter);
                    const label = objRefToString(filterObjRef(attributeFilter));
                    const elements = filterAttributeElements(attributeFilter);
                    const values = isAttributeElementsByRef(elements) ? elements.uris : elements.values;

                    return {
                        label,
                        values: values,
                        complementFilter,
                    };
                });

            result = [...result, ...dependsOn];
        }

        if (dateFilters) {
            const dependsOn: DependsOnDateFilter[] = dateFilters.map(
                mapDashboardDateFilterToDependentDateFilter,
            );

            result = [...result, ...dependsOn];
        }
        return result.length > 0 ? { dependsOn: result } : {};
    }

    private buildElementsRequest(
        options: IElementsQueryOptions | undefined,
        labelIdentifier: string,
        cacheId: string | undefined,
    ): ElementsRequest {
        return {
            label: labelIdentifier,
            ...(options?.complement && { complementFilter: options.complement }),
            ...(options?.filter && { patternFilter: options.filter }),
            ...this.getExactFilterSpec(options ?? {}),
            ...this.getDependsOnSpec(),
            ...(options?.excludePrimaryLabel && {
                excludePrimaryLabel: options.excludePrimaryLabel,
            }),
            ...(options?.order && {
                sortOrder: options.order === "asc" ? "ASC" : "DESC",
            }),
            ...(this.validateBy && { validateBy: this.validateBy.map(this.mapValidationItems) }),
            ...(cacheId && { cacheId: cacheId }),
            ...(options?.filterByPrimaryLabel && {
                filterBy: {
                    labelType: "PRIMARY",
                },
            }),
        };
    }

    private mapElementToAttributeElement(
        element: { title: string | null; primaryTitle?: string | null },
        shouldFormatTitle: boolean,
        dateValueFormatter: ReturnType<typeof createDateValueFormatter>,
        dateValueNormalizer: ReturnType<typeof createDateValueNormalizer>,
        sdkGranularity: ReturnType<typeof toSdkGranularity>,
        locale: FormattingLocale,
        pattern: string,
    ): IAttributeElement {
        let objWithFormatted = {};

        if (shouldFormatTitle) {
            const formattedTitle = dateValueFormatter(element.title, sdkGranularity, locale, pattern);
            const normalizedValue = dateValueNormalizer(element.title, sdkGranularity, locale);
            objWithFormatted = {
                formattedTitle,
                normalizedValue,
            };
        }

        return {
            title: element.title,
            uri: element.primaryTitle ?? element.title,
            ...objWithFormatted,
        };
    }

    private async queryWorker(options: IElementsQueryOptions | undefined): Promise<IElementsQueryResult> {
        const { ref } = this;
        if (!isIdentifierRef(ref)) {
            throw new UnexpectedError("Tiger backend does not allow referencing objects by URI");
        }

        return ServerPaging.for(
            async ({ offset, limit, cacheId }) => {
                const elementsRequest = this.buildElementsRequest(options, ref.identifier, cacheId);

                const response = await this.authCall((client) => {
                    return ActionsApi_ComputeLabelElementsPost(
                        client.axios,
                        "",
                        {
                            limit: limit,
                            offset: offset,
                            elementsRequest,
                            workspaceId: this.workspace,
                        },
                        {
                            ...new TigerCancellationConverter(this.signal).forAxios(),
                        },
                    );
                });

                const { paging, elements, format, granularity, cacheId: responseCacheId } = response.data;

                const elementsGranularity = granularity as ElementsResponseGranularityEnum;
                const sdkGranularity = toSdkGranularity(elementsGranularity);
                const locale = format?.locale as FormattingLocale;
                const pattern = format?.pattern as string;
                const shouldFormatTitle = !!(sdkGranularity && format);
                const dateValueFormatter = createDateValueFormatter(this.dateFormatter);
                const dateValueNormalizer = createDateValueNormalizer();

                return {
                    items: elements.map((element) =>
                        this.mapElementToAttributeElement(
                            element,
                            shouldFormatTitle,
                            dateValueFormatter,
                            dateValueNormalizer,
                            sdkGranularity,
                            locale,
                            pattern,
                        ),
                    ),
                    totalCount: paging.total,
                    cacheId: responseCacheId,
                };
            },
            this.limit,
            this.offset,
            this.options?.cacheId,
        );
    }

    private mapValidationItems(item: ObjRef) {
        return toObjQualifier(item).identifier;
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
