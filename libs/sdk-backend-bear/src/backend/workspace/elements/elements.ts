// (C) 2019-2020 GoodData Corporation
import {
    IElementQueryFactory,
    IElementQuery,
    IElementQueryOptions,
    IElementQueryResult,
} from "@gooddata/sdk-backend-spi";
import { IAttributeElement, ObjRef } from "@gooddata/sdk-model";
import invariant from "ts-invariant";

import { BearAuthenticatedCallGuard } from "../../../types/auth";
import { objRefToUri, getObjectIdFromUri } from "../../../utils/api";

export class BearWorkspaceElements implements IElementQueryFactory {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public forDisplayForm(ref: ObjRef): IElementQuery {
        return new BearWorkspaceElementsQuery(this.authCall, ref, this.workspace);
    }
}

class BearWorkspaceElementsQuery implements IElementQuery {
    private limit: number | undefined;
    private offset: number | undefined;
    private options: IElementQueryOptions | undefined;

    // cached value of objectId corresponding to identifier
    private objectId: string | undefined;

    constructor(
        private readonly authCall: BearAuthenticatedCallGuard,
        private readonly ref: ObjRef,
        private readonly workspace: string,
    ) {}

    public withLimit(limit: number): IElementQuery {
        invariant(limit > 0, "limit must be a positive number");

        this.limit = limit;

        return this;
    }

    public withOffset(offset: number): IElementQuery {
        this.offset = offset;
        return this;
    }

    public withOptions(options: IElementQueryOptions): IElementQuery {
        this.options = options;
        return this;
    }

    public async query(): Promise<IElementQueryResult> {
        return this.queryWorker(this.offset, this.limit, this.options);
    }

    private async getObjectId(): Promise<string> {
        if (!this.objectId) {
            const uri = await objRefToUri(this.ref, this.workspace, this.authCall);
            this.objectId = getObjectIdFromUri(uri);
        }

        return this.objectId;
    }

    private async queryWorker(
        offset: number | undefined = 0,
        limit: number | undefined,
        options: IElementQueryOptions | undefined,
    ): Promise<IElementQueryResult> {
        const mergedOptions = { ...options, limit, offset };
        const objectId = await this.getObjectId();
        const data = await this.authCall(sdk =>
            sdk.md.getValidElements(this.workspace, objectId, mergedOptions),
        );

        const { items, paging } = data.validElements;
        const total = Number.parseInt(paging.total, 10);
        const serverOffset = Number.parseInt(paging.offset, 10);
        const { count } = paging;

        const hasNextPage = serverOffset + count < total;

        const emptyResult: IElementQueryResult = {
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
