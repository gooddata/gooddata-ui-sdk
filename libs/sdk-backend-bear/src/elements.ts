// (C) 2019 GoodData Corporation
import {
    IElementQueryFactory,
    IElementQuery,
    IElementQueryOptions,
    IElementQueryResult,
} from "@gooddata/sdk-backend-spi";
import { AuthenticatedCallGuard } from "./commonTypes";

export class BearWorkspaceElements implements IElementQueryFactory {
    constructor(private readonly authCall: AuthenticatedCallGuard, public readonly workspace: string) {}

    public forObject(objectId: string): IElementQuery {
        return new BearWorkspaceElementsQuery(this.authCall, objectId, this.workspace);
    }
}

class BearWorkspaceElementsQuery implements IElementQuery {
    private limit: number | undefined;
    private offset: number | undefined;
    private options: IElementQueryOptions | undefined;

    constructor(
        private readonly authCall: AuthenticatedCallGuard,
        private readonly objectId: string,
        private readonly workspace: string,
    ) {}

    public withLimit(limit: number): IElementQuery {
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

    private async queryWorker(
        offset: number | undefined,
        limit: number | undefined,
        options: IElementQueryOptions | undefined,
    ): Promise<IElementQueryResult> {
        const mergedOptions = { ...options, limit, offset };
        const data = await this.authCall(sdk =>
            sdk.md.getValidElements(this.workspace, this.objectId, mergedOptions),
        );

        const { items, paging } = data.validElements;
        const total = Number.parseInt(paging.total, 10);
        const serverOffset = Number.parseInt(paging.offset, 10);
        const { count } = paging;

        const hasNextPage = serverOffset + count < total;

        const emptyResult: IElementQueryResult = {
            elements: [],
            limit: count,
            offset: total,
            next: () => Promise.resolve(emptyResult),
        };

        return {
            elements: items.map((element: { element: Element }) => element.element), // TODO helper
            limit: count,
            offset: serverOffset,
            next: hasNextPage
                ? () => this.queryWorker(offset + count, limit, options)
                : () => Promise.resolve(emptyResult),
        };
    }
}
