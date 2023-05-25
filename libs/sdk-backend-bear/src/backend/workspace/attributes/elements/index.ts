// (C) 2019-2023 GoodData Corporation
import {
    IElementsQueryFactory,
    IElementsQuery,
    IElementsQueryOptions,
    IElementsQueryResult,
    IElementsQueryAttributeFilter,
    IFilterElementsQuery,
    FilterWithResolvableElements,
    isValueBasedElementsQueryOptionsElements,
} from "@gooddata/sdk-backend-spi";
import {
    filterObjRef,
    IAttributeFilter,
    IRelativeDateFilter,
    IMeasure,
    ObjRef,
    isAttributeFilter,
    filterAttributeElements,
    isAttributeElementsByRef,
    IAttributeElementsByValue,
    IAttributeElementsByRef,
    isRelativeDateFilter,
    IAttributeElement,
} from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";

import { BearAuthenticatedCallGuard } from "../../../../types/auth.js";
import { objRefToUri, getObjectIdFromUri } from "../../../../utils/api.js";
import { GdcExecuteAFM, GdcMetadata } from "@gooddata/api-model-bear";
import { LimitingAfmFactory } from "./limitingAfmFactory.js";
import { InMemoryPaging, ServerPaging } from "@gooddata/sdk-backend-base";

export class BearWorkspaceElements implements IElementsQueryFactory {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public forDisplayForm(ref: ObjRef): IElementsQuery {
        return new BearWorkspaceElementsQuery(this.authCall, ref, this.workspace);
    }

    public forFilter(
        filter: IAttributeFilter | IRelativeDateFilter,
        dateFilterDisplayForm?: ObjRef,
    ): IFilterElementsQuery {
        return new BearWorkspaceFilterElementsQuery(
            this.authCall,
            filter,
            dateFilterDisplayForm,
            this.workspace,
        );
    }
}

class BearWorkspaceElementsQuery implements IElementsQuery {
    private limit: number = 50;
    private offset: number = 0;
    private options: IElementsQueryOptions | undefined;
    private attributeFilters: IElementsQueryAttributeFilter[] | undefined;
    private dateFilters: IRelativeDateFilter[] | undefined;
    private measures: IMeasure[] | undefined;
    // cached AFM used to apply attributeRef and attributeFilters to the element queries
    private limitingAfm: GdcExecuteAFM.IAfm | undefined;

    // cached value of objectId corresponding to identifier
    private objectId: string | undefined;

    constructor(
        private readonly authCall: BearAuthenticatedCallGuard,
        private readonly displayFormRef: ObjRef,
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

    public withAttributeFilters(filters: IElementsQueryAttributeFilter[]): IElementsQuery {
        this.attributeFilters = filters;
        return this;
    }

    public withDateFilters(filters: IRelativeDateFilter[]): IElementsQuery {
        this.dateFilters = filters;
        return this;
    }

    public withMeasures(measures: IMeasure[]): IElementsQuery {
        this.measures = measures.length > 0 ? measures : undefined;
        return this;
    }

    public withOptions(options: IElementsQueryOptions): IElementsQuery {
        this.options = options;
        return this;
    }

    public withSignal(_: AbortSignal): IElementsQuery {
        console.warn("Cancelling requests is not supported on bear backend.");
        return this;
    }

    public async query(): Promise<IElementsQueryResult> {
        const limitingAfmFactory = new LimitingAfmFactory(this.authCall, this.displayFormRef, this.workspace);
        this.limitingAfm = await limitingAfmFactory.getAfm(
            this.attributeFilters,
            this.measures,
            this.dateFilters,
        );

        return this.queryWorker(this.options ?? {});
    }

    private async getObjectId(): Promise<string> {
        if (!this.objectId) {
            const uri = await objRefToUri(this.displayFormRef, this.workspace, this.authCall);
            this.objectId = getObjectIdFromUri(uri);
        }

        return this.objectId;
    }

    private async queryWorker(options: IElementsQueryOptions): Promise<IElementsQueryResult> {
        const objectId = await this.getObjectId();

        const { elements, ...restOptions } = options;

        invariant(
            !isValueBasedElementsQueryOptionsElements(elements),
            "Specifying elements by value is not supported.",
        );

        const urisToUse = elements?.uris;

        invariant(
            !urisToUse || urisToUse.every((item) => item !== null),
            "Nulls are not supported as attribute element uris on bear",
        );

        return ServerPaging.for(
            async ({ limit, offset }) => {
                const params: GdcMetadata.IValidElementsParams = {
                    ...restOptions,
                    ...{ uris: urisToUse as string[] | undefined },
                    limit,
                    offset,
                    afm: this.limitingAfm,
                };
                const data = await this.authCall((sdk) =>
                    sdk.md.getValidElements(this.workspace, objectId, params),
                );

                const { items, paging } = data.validElements;
                const totalCount = Number.parseInt(paging.total, 10);

                return {
                    items: items.map(({ element }) => element),
                    totalCount,
                };
            },
            this.limit,
            this.offset,
        );
    }
}

class BearWorkspaceFilterElementsQuery implements IFilterElementsQuery {
    private limit: number = 50;
    private offset: number = 0;
    private elementsQuery: IElementsQuery;

    constructor(
        private readonly authCall: BearAuthenticatedCallGuard,
        private filter: FilterWithResolvableElements,
        dateDf: ObjRef | undefined,
        private readonly workspace: string,
    ) {
        let ref = filterObjRef(filter);
        if (isRelativeDateFilter(filter)) {
            invariant(dateDf, "Date filter's display form needs to be defined");
            ref = dateDf;
        }
        this.elementsQuery = new BearWorkspaceElementsQuery(this.authCall, ref, this.workspace);
    }

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
            const selectedElements = filterAttributeElements(this.filter);
            if (isAttributeElementsByRef(selectedElements)) {
                return this.resultForElementsByRef(selectedElements);
            }
            return this.resultForElementsByValue(selectedElements);
        } else {
            return this.elementsQuery.withDateFilters([this.filter]).query();
        }
    }

    private async resultForElementsByRef(selectedElements: IAttributeElementsByRef) {
        if (selectedElements.uris.length) {
            return this.elementsQuery
                .withOptions({
                    elements: {
                        uris: selectedElements.uris,
                    },
                })
                .withOffset(this.offset)
                .withLimit(this.limit)
                .query();
        }
        // Filter with empty selection resolves to empty values
        return Promise.resolve(new InMemoryPaging<IAttributeElement>([], this.limit, this.offset));
    }

    private async resultForElementsByValue(
        selectedElements: IAttributeElementsByValue,
    ): Promise<IElementsQueryResult> {
        const items = selectedElements.values.map(
            (element): IAttributeElement => ({
                title: element,
                uri: element,
            }),
        );

        return Promise.resolve(new InMemoryPaging<IAttributeElement>(items, this.limit, this.offset));
    }
}
