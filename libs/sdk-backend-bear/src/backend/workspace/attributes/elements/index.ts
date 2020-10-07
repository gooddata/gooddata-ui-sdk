// (C) 2019-2020 GoodData Corporation
import {
    IElementsQueryFactory,
    IElementsQuery,
    IElementsQueryOptions,
    IElementsQueryResult,
} from "@gooddata/sdk-backend-spi";
import { IAttributeElement, ObjRef } from "@gooddata/sdk-model";
import invariant from "ts-invariant";

import { BearAuthenticatedCallGuard } from "../../../../types/auth";
import { objRefToUri, getObjectIdFromUri } from "../../../../utils/api";
import { IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import { GdcExecuteAFM } from "@gooddata/api-model-bear";
import { LimitingAfmFactory } from "./limitingAfmFactory";

export class BearWorkspaceElements implements IElementsQueryFactory {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public forDisplayForm(ref: ObjRef): IElementsQuery {
        return new BearWorkspaceElementsQuery(this.authCall, ref, this.workspace);
    }
}

class BearWorkspaceElementsQuery implements IElementsQuery {
    private limit: number = 50;
    private offset: number = 0;
    private options: IElementsQueryOptions | undefined;
    private attributeFilters: IElementsQueryAttributeFilter[] | undefined;
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

    public withOptions(options: IElementsQueryOptions): IElementsQuery {
        this.options = options;
        return this;
    }

    public async query(): Promise<IElementsQueryResult> {
        const limitingAfmFactory = new LimitingAfmFactory(this.authCall, this.displayFormRef, this.workspace);

        this.limitingAfm = await limitingAfmFactory.getAfm(this.attributeFilters);

        return this.queryWorker(this.offset, this.limit, this.options);
    }

    private async getObjectId(): Promise<string> {
        if (!this.objectId) {
            const uri = await objRefToUri(this.displayFormRef, this.workspace, this.authCall);
            this.objectId = getObjectIdFromUri(uri);
        }

        return this.objectId;
    }

    private async queryWorker(
        offset: number,
        limit: number,
        options: IElementsQueryOptions | undefined,
    ): Promise<IElementsQueryResult> {
        const mergedOptions = { ...options, limit, offset, afm: this.limitingAfm };
        const objectId = await this.getObjectId();
        const data = await this.authCall((sdk) =>
            sdk.md.getValidElements(this.workspace, objectId, mergedOptions),
        );

        const { items, paging } = data.validElements;
        const total = Number.parseInt(paging.total, 10);
        const serverOffset = Number.parseInt(paging.offset, 10);
        const { count } = paging;

        const hasNextPage = serverOffset + count < total;

        const emptyResult: IElementsQueryResult = {
            items: [],
            limit: count,
            offset: total,
            totalCount: total,
            next: () => Promise.resolve(emptyResult),
        };

        return {
            items: items.map((element: { element: IAttributeElement }) => element.element),
            limit: count,
            offset: serverOffset,
            totalCount: total,
            next: hasNextPage
                ? () => this.queryWorker(offset + count, limit, options)
                : () => Promise.resolve(emptyResult),
        };
    }
}
